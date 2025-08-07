"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNdk } from "nostr-hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { type NDKEvent, type NDKFilter } from "@nostr-dev-kit/ndk";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Collapse,
  Chip,
  IconButton,
  Divider,
  Paper,
  Grid,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import EventFilters, {
  type EventFilters as EventFiltersType,
} from "@/components/common/events/EventFilters";
import { getEventMetadata } from "@/utils/nostr/eventUtils";
import {
  isLocationWithinRadius,
  normalizeLocation,
} from "@/utils/location/locationUtils";
import dayjs from "dayjs";

// Optimized event cache with immediate display
const eventCache = new Map<string, { events: NDKEvent[]; timestamp: number }>();
const CACHE_DURATION = 45 * 60 * 1000; // 45 minutes for longer cache
const INSTANT_CACHE_KEY = "instant-events";
const BACKGROUND_CACHE_KEY = "background-events";

// Fast cache operations
const getCachedEvents = (key: string): NDKEvent[] | null => {
  const cached = eventCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.events;
  }
  return null;
};

const cacheEvents = (key: string, events: NDKEvent[]) => {
  eventCache.set(key, {
    events: [...events],
    timestamp: Date.now(),
  });
};

const getDefaultFilters = (): EventFiltersType => ({
  dateRange: {
    start: null,
    end: null,
  },
  location: null,
  useGeolocation: false,
  userLocation: null,
  tags: [],
  searchQuery: "",
});

const defaultFilters: EventFiltersType = getDefaultFilters();

interface UpcomingEventsSectionProps {
  title?: string;
  showFilters?: boolean;
  filtersDefaultOpen?: boolean;
}

const OptimizedUpcomingEventsSection: React.FC<UpcomingEventsSectionProps> = ({
  title = "Upcoming Events",
  showFilters = true,
  filtersDefaultOpen = false,
}) => {
  const { t } = useTranslation();
  const { ndk } = useNdk();
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [events, setEvents] = useState<NDKEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [filters, setFilters] = useState<EventFiltersType>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = useState(filtersDefaultOpen);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Immediate cache check on mount
  useEffect(() => {
    setIsClient(true);

    // Check for instant cached events first
    const instantCache = getCachedEvents(INSTANT_CACHE_KEY);
    if (instantCache && instantCache.length > 0) {
      console.log("⚡ Loading events from instant cache");
      setEvents(instantCache);
      setLoading(false);

      // Extract metadata for filters
      const locations = new Set<string>();
      const tags = new Set<string>();
      instantCache.forEach((event) => {
        const metadata = getEventMetadata(event);
        if (metadata.location) locations.add(metadata.location);
        metadata.hashtags.forEach((tag) => tags.add(tag));
      });
      setAvailableLocations(Array.from(locations).sort());
      setAvailableTags(Array.from(tags).sort());
    }

    // Initialize filters from URL
    const urlFilters = urlParamsToFilters(searchParams);
    if (!urlFilters.dateRange.start && !urlFilters.dateRange.end) {
      urlFilters.dateRange = {
        start: dayjs(),
        end: dayjs().add(3, "months"),
      };
    }
    setFilters(urlFilters);
  }, []);

  // Fast event fetching with immediate display
  const fetchEventsQuick = useCallback(async () => {
    if (!ndk) return;

    console.log("🚀 Starting fast event fetch");

    // Don't show loading if we have cached events
    const hasCached = getCachedEvents(INSTANT_CACHE_KEY);
    if (!hasCached) {
      setLoading(true);
    }

    const now = Math.floor(Date.now() / 1000);
    const sixMonthsFromNow = Math.floor(dayjs().add(6, "months").unix());

    try {
      // Priority strategy: recent and upcoming events with high limits
      const quickFilters: NDKFilter[] = [
        {
          kinds: [31922 as any, 31923 as any],
          since: now,
          until: sixMonthsFromNow,
          limit: 1000,
        },
        {
          kinds: [31922 as any, 31923 as any],
          since: now - 7 * 24 * 3600, // Last week
          limit: 500,
        },
      ];

      // Fetch the first batch immediately
      const firstFilter = quickFilters[0];
      console.log("⚡ Fetching first batch...");

      const firstBatch = await ndk.fetchEvents(firstFilter);
      const firstEvents = Array.from(firstBatch.values()) as NDKEvent[];

      if (firstEvents.length > 0) {
        console.log(`⚡ Got ${firstEvents.length} events in first batch`);

        // Filter and sort immediately
        const upcomingEvents = firstEvents
          .filter((event) => {
            const metadata = getEventMetadata(event);
            if (!metadata.start) return false;
            const eventStart = parseInt(metadata.start);
            return eventStart >= now && eventStart <= sixMonthsFromNow;
          })
          .sort((a, b) => {
            const aStart = getEventMetadata(a).start;
            const bStart = getEventMetadata(b).start;
            if (!aStart) return 1;
            if (!bStart) return -1;
            return parseInt(aStart) - parseInt(bStart);
          });

        // Show immediately
        setEvents(upcomingEvents.slice(0, 50));
        setLoading(false);

        // Cache for instant loading
        cacheEvents(INSTANT_CACHE_KEY, upcomingEvents);

        // Extract filter data
        const locations = new Set<string>();
        const tags = new Set<string>();
        upcomingEvents.forEach((event) => {
          const metadata = getEventMetadata(event);
          if (metadata.location) locations.add(metadata.location);
          metadata.hashtags.forEach((tag) => tags.add(tag));
        });
        setAvailableLocations(Array.from(locations).sort());
        setAvailableTags(Array.from(tags).sort());
      }

      // Continue with background fetching for more events
      setBackgroundLoading(true);
      const remainingPromises = quickFilters.slice(1).map(async (filter) => {
        try {
          const events = await ndk.fetchEvents(filter);
          return Array.from(events.values()) as NDKEvent[];
        } catch (error) {
          console.error("Background fetch error:", error);
          return [];
        }
      });

      const additionalResults = await Promise.all(remainingPromises);
      const allAdditionalEvents = additionalResults.flat();

      if (allAdditionalEvents.length > 0) {
        console.log(`🔄 Got ${allAdditionalEvents.length} additional events`);

        // Merge and deduplicate
        const allEvents = [...firstEvents, ...allAdditionalEvents];
        const uniqueEvents = allEvents.filter(
          (event, index, self) =>
            index === self.findIndex((e) => e.id === event.id)
        );

        const allUpcomingEvents = uniqueEvents
          .filter((event) => {
            const metadata = getEventMetadata(event);
            if (!metadata.start) return false;
            const eventStart = parseInt(metadata.start);
            return eventStart >= now && eventStart <= sixMonthsFromNow;
          })
          .sort((a, b) => {
            const aStart = getEventMetadata(a).start;
            const bStart = getEventMetadata(b).start;
            if (!aStart) return 1;
            if (!bStart) return -1;
            return parseInt(aStart) - parseInt(bStart);
          });

        // Update with full dataset
        setEvents(allUpcomingEvents);
        cacheEvents(BACKGROUND_CACHE_KEY, allUpcomingEvents);

        // Update filter data
        const allLocations = new Set<string>();
        const allTags = new Set<string>();
        allUpcomingEvents.forEach((event) => {
          const metadata = getEventMetadata(event);
          if (metadata.location) allLocations.add(metadata.location);
          metadata.hashtags.forEach((tag) => allTags.add(tag));
        });
        setAvailableLocations(Array.from(allLocations).sort());
        setAvailableTags(Array.from(allTags).sort());
      }
    } catch (error) {
      console.error("Error in fast fetch:", error);
      setEvents([]);
    } finally {
      setLoading(false);
      setBackgroundLoading(false);
    }
  }, [ndk]);

  // Load events on NDK ready
  useEffect(() => {
    if (ndk && isClient) {
      fetchEventsQuick();
    }
  }, [ndk, isClient, fetchEventsQuick]);

  // URL synchronization
  const filtersToURLParams = useCallback((filters: EventFiltersType) => {
    const params = new URLSearchParams();
    if (filters.searchQuery) params.set("search", filters.searchQuery);
    if (filters.location) params.set("location", filters.location.name);
    if (filters.tags.length > 0) params.set("tags", filters.tags.join(","));
    if (filters.dateRange.start) {
      params.set("startDate", filters.dateRange.start.format("YYYY-MM-DD"));
    }
    if (filters.dateRange.end) {
      params.set("endDate", filters.dateRange.end.format("YYYY-MM-DD"));
    }
    return params;
  }, []);

  const urlParamsToFilters = useCallback(
    (params: URLSearchParams): EventFiltersType => {
      const newFilters: EventFiltersType = { ...defaultFilters };
      const search = params.get("search");
      if (search) newFilters.searchQuery = search;

      const location = params.get("location");
      if (location) {
        newFilters.location = { name: location, coordinates: null, radius: 50 };
      }

      const tags = params.get("tags");
      if (tags) {
        newFilters.tags = tags.split(",").filter((tag) => tag.trim());
      }

      const startDate = params.get("startDate");
      if (startDate) {
        const parsed = dayjs(startDate);
        if (parsed.isValid()) newFilters.dateRange.start = parsed;
      }

      const endDate = params.get("endDate");
      if (endDate) {
        const parsed = dayjs(endDate);
        if (parsed.isValid()) newFilters.dateRange.end = parsed;
      }

      return newFilters;
    },
    []
  );

  const updateURL = useCallback(
    (filters: EventFiltersType) => {
      if (!isClient) return;
      const params = filtersToURLParams(filters);
      const currentPath = window.location.pathname;
      const newURL = params.toString()
        ? `${currentPath}?${params.toString()}`
        : currentPath;
      router.replace(newURL, { scroll: false });
    },
    [router, filtersToURLParams, isClient]
  );

  // Calculate active filter count
  useEffect(() => {
    if (!isClient) return;
    let count = 0;
    if (filters.location) count++;
    if (filters.tags.length > 0) count++;
    if (filters.searchQuery.trim()) count++;
    if (
      filters.dateRange.start &&
      !filters.dateRange.start.isSame(dayjs(), "day")
    )
      count++;
    if (
      filters.dateRange.end &&
      !filters.dateRange.end.isSame(dayjs().add(3, "months"), "day")
    )
      count++;
    setActiveFilterCount(count);
  }, [filters, isClient]);

  // Fast client-side filtering
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const metadata = getEventMetadata(event);

      // Date range filter
      if (metadata.start) {
        const eventStart = dayjs.unix(parseInt(metadata.start));
        if (
          filters.dateRange.start &&
          eventStart.isBefore(filters.dateRange.start, "day")
        ) {
          return false;
        }
        if (
          filters.dateRange.end &&
          eventStart.isAfter(filters.dateRange.end, "day")
        ) {
          return false;
        }
      }

      // Location filter with geolocation support
      if (filters.location) {
        if (metadata.location) {
          if (filters.useGeolocation && filters.userLocation) {
            const withinRadius = isLocationWithinRadius(
              metadata.location,
              filters.userLocation,
              filters.location.radius
            );
            if (!withinRadius) return false;
          } else {
            const eventLocationNormalized = normalizeLocation(
              metadata.location
            );
            const filterLocationNormalized = normalizeLocation(
              filters.location.name
            );

            const locationMatch =
              eventLocationNormalized.normalized
                .toLowerCase()
                .includes(filterLocationNormalized.normalized.toLowerCase()) ||
              filterLocationNormalized.normalized
                .toLowerCase()
                .includes(eventLocationNormalized.normalized.toLowerCase()) ||
              metadata.location
                .toLowerCase()
                .includes(filters.location.name.toLowerCase());

            if (!locationMatch) return false;
          }
        } else {
          return false;
        }
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const eventTags = metadata.hashtags.map((tag) => tag.toLowerCase());
        const hasMatchingTag = filters.tags.some((filterTag) =>
          eventTags.some((eventTag) =>
            eventTag.includes(filterTag.toLowerCase())
          )
        );
        if (!hasMatchingTag) return false;
      }

      // Search query filter
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const searchableText = [
          metadata.title,
          metadata.summary,
          metadata.location,
          ...metadata.hashtags,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(query)) return false;
      }

      return true;
    });
  }, [events, filters]);

  const handleFiltersChange = (newFilters: EventFiltersType) => {
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      ...defaultFilters,
      dateRange: { start: dayjs(), end: dayjs().add(3, "months") },
    };
    setFilters(clearedFilters);
    updateURL(clearedFilters);
  };

  if (!isClient) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header with filter toggle */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h5" component="h2">
          {title}
          {backgroundLoading && <CircularProgress size={16} sx={{ ml: 2 }} />}
        </Typography>

        {showFilters && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {activeFilterCount > 0 && (
              <>
                <Chip
                  label={`${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} active`}
                  size="small"
                  color="primary"
                  onDelete={clearFilters}
                  deleteIcon={<ClearIcon />}
                />
              </>
            )}
            <Button
              variant="outlined"
              size="small"
              startIcon={<FilterListIcon />}
              endIcon={filtersOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              {t("events.filters.toggle", "Filters")}
            </Button>
          </Box>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Filters */}
      {showFilters && (
        <Collapse in={filtersOpen}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <EventFilters
              filters={filters}
              onChange={handleFiltersChange}
              availableLocations={availableLocations}
              availableTags={availableTags}
            />
          </Paper>
        </Collapse>
      )}

      {/* Events */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading events...</Typography>
        </Box>
      ) : filteredEvents.length > 0 ? (
        <Grid container spacing={3}>
          {filteredEvents.map((event) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={event.id}>
              <Box
                component="a"
                href={`/event/${event.encode()}`}
                sx={{
                  display: "block",
                  textDecoration: "none",
                  color: "inherit",
                  height: "100%",
                }}
              >
                <Paper
                  sx={{
                    p: 2,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  {(() => {
                    const metadata = getEventMetadata(event);
                    return (
                      <>
                        <Typography
                          variant="h6"
                          component="h3"
                          gutterBottom
                          noWrap
                        >
                          {metadata.title || "Untitled Event"}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          {metadata.start &&
                            dayjs
                              .unix(parseInt(metadata.start))
                              .format("MMM D, YYYY h:mm A")}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          📍 {metadata.location || "Location TBD"}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ flexGrow: 1, overflow: "hidden" }}
                        >
                          {metadata.summary || "No description available"}
                        </Typography>
                        {metadata.hashtags.length > 0 && (
                          <Box
                            sx={{
                              mt: 1,
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.5,
                            }}
                          >
                            {metadata.hashtags.slice(0, 3).map((tag, index) => (
                              <Chip
                                key={index}
                                label={`#${tag}`}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        )}
                      </>
                    );
                  })()}
                </Paper>
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t("events.noEventsFound", "No events found")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {activeFilterCount > 0
              ? t("events.tryDifferentFilters", "Try adjusting your filters")
              : t(
                  "events.noEventsAvailable",
                  "No events are currently available"
                )}
          </Typography>
          {activeFilterCount > 0 && (
            <Button onClick={clearFilters} sx={{ mt: 2 }}>
              {t("events.clearFilters", "Clear Filters")}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default OptimizedUpcomingEventsSection;
