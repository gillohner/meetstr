"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNdk } from "nostr-hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { type NDKEvent, type NDKFilter } from "@nostr-dev-kit/ndk";
import {
  Box,
  Typography,
  Divider,
  Grid,
  CircularProgress,
  Paper,
  Chip,
  IconButton,
  Collapse,
  Button,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import EventPreviewCard from "@/components/common/events/EventPreviewCard";
import EventFilters, {
  type EventFilters as EventFiltersType,
} from "@/components/common/events/EventFilters";
import { getEventMetadata } from "@/utils/nostr/eventUtils";
import dayjs from "dayjs";

const getDefaultFilters = (): EventFiltersType => ({npm 
  dateRange: {
    start: null,
    end: null,
  },
  location: null,
  tags: [],
  searchQuery: "",
  batchSize: 50,
});

const defaultFilters: EventFiltersType = getDefaultFilters();

interface UpcomingEventsSectionProps {
  title?: string;
  showFilters?: boolean;
}

const INITIAL_DISPLAY_COUNT = 20; // Show 20 events initially
const LOAD_MORE_COUNT = 10; // Show 10 more when clicking "Load More"

const UpcomingEventsSection: React.FC<UpcomingEventsSectionProps> = ({
  title = "Upcoming Events",
  showFilters = true,
}) => {
  const { t } = useTranslation();
  const { ndk } = useNdk();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [allEvents, setAllEvents] = useState<NDKEvent[]>([]); // All fetched events
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT); // How many to show
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [filters, setFilters] = useState<EventFiltersType>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  // URL synchronization functions
  const filtersToURLParams = useCallback((filters: EventFiltersType) => {
    const params = new URLSearchParams();
    if (filters.searchQuery) params.set("search", filters.searchQuery);
    if (filters.location) params.set("location", filters.location.name);
    if (filters.tags.length > 0) params.set("tags", filters.tags.join(","));
    if (filters.dateRange.start)
      params.set("startDate", filters.dateRange.start.format("YYYY-MM-DD"));
    if (filters.dateRange.end)
      params.set("endDate", filters.dateRange.end.format("YYYY-MM-DD"));
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

  // Initialize from URL
  useEffect(() => {
    setIsClient(true);
    const urlFilters = urlParamsToFilters(searchParams);

    // Set default date range if not specified
    if (!urlFilters.dateRange.start && !urlFilters.dateRange.end) {
      urlFilters.dateRange = {
        start: dayjs(),
        end: dayjs().add(6, "months"),
      };
    }

    setFilters(urlFilters);
  }, [searchParams, urlParamsToFilters]);

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
      !filters.dateRange.end.isSame(dayjs().add(6, "months"), "day")
    )
      count++;
    setActiveFilterCount(count);
  }, [filters, isClient]);

  // Fetch ALL events aggressively
  const fetchAllEvents = useCallback(async () => {
    if (!ndk) return;

    setLoading(true);
    const now = Math.floor(Date.now() / 1000);
    const sixMonthsFromNow = Math.floor(dayjs().add(6, "months").unix());

    try {
      // Multiple aggressive strategies to get as many events as possible
      const filters: NDKFilter[] = [
        // Get recent events (last 30 days)
        {
          kinds: [31922 as any, 31923 as any],
          since: now - 30 * 24 * 3600,
          limit: 500,
        },
        // Get future events
        {
          kinds: [31922 as any, 31923 as any],
          since: now,
          until: sixMonthsFromNow,
          limit: 500,
        },
        // Get events without time restrictions (some might have wrong timestamps)
        {
          kinds: [31922 as any, 31923 as any],
          limit: 300,
        },
      ];

      console.log("Fetching all upcoming events with aggressive strategies...");

      // Fetch from all strategies in parallel
      const fetchPromises = filters.map(async (filter) => {
        try {
          const eventSet = await ndk.fetchEvents(filter);
          return Array.from(eventSet.values());
        } catch (error) {
          console.error("Error fetching with filter:", filter, error);
          return [];
        }
      });

      const results = await Promise.all(fetchPromises);
      const allFetchedEvents: NDKEvent[] = [];
      results.forEach((events) => allFetchedEvents.push(...events));

      console.log(`Total raw events fetched: ${allFetchedEvents.length}`);

      // Remove duplicates
      const uniqueEvents = allFetchedEvents.filter(
        (event, index, self) =>
          index === self.findIndex((e) => e.id === event.id)
      );

      console.log(`Unique events after deduplication: ${uniqueEvents.length}`);

      // Filter for upcoming events and extract metadata
      const upcomingEvents = uniqueEvents.filter((event) => {
        const metadata = getEventMetadata(event);
        if (!metadata.start) return false;
        const eventStart = parseInt(metadata.start);
        return eventStart >= now;
      });

      // Sort chronologically
      upcomingEvents.sort((a, b) => {
        const aStart = getEventMetadata(a).start;
        const bStart = getEventMetadata(b).start;
        if (!aStart) return 1;
        if (!bStart) return -1;
        return parseInt(aStart) - parseInt(bStart);
      });

      console.log(`Final upcoming events: ${upcomingEvents.length}`);

      // Extract locations and tags for filters
      const locations = new Set<string>();
      const tags = new Set<string>();

      upcomingEvents.forEach((event) => {
        const metadata = getEventMetadata(event);
        if (metadata.location) locations.add(metadata.location);
        metadata.hashtags.forEach((tag) => {
          if (tag) tags.add(tag);
        });
      });

      setAvailableLocations(Array.from(locations).sort());
      setAvailableTags(Array.from(tags).sort());
      setAllEvents(upcomingEvents);

      // Start background fetching for even more events
      setTimeout(() => {
        fetchMoreInBackground();
      }, 2000);
    } catch (error) {
      console.error("Error fetching all events:", error);
      setAllEvents([]);
    } finally {
      setLoading(false);
    }
  }, [ndk]);

  // Background fetching for additional events
  const fetchMoreInBackground = useCallback(async () => {
    if (!ndk || fetchingMore) return;

    setFetchingMore(true);

    try {
      // Additional strategies for more events
      const filters: NDKFilter[] = [
        // Look further back
        {
          kinds: [31922 as any, 31923 as any],
          until: Math.floor(Date.now() / 1000) - 30 * 24 * 3600,
          limit: 300,
        },
        // Search by popular tags if we have them
        ...(availableTags.length > 0
          ? [
              {
                kinds: [31922 as any, 31923 as any],
                "#t": availableTags.slice(0, 10),
                limit: 200,
              },
            ]
          : []),
      ];

      const fetchPromises = filters.map(async (filter) => {
        try {
          const eventSet = await ndk.fetchEvents(filter);
          return Array.from(eventSet.values());
        } catch (error) {
          return [];
        }
      });

      const results = await Promise.all(fetchPromises);
      const newEvents: NDKEvent[] = [];
      results.forEach((events) => newEvents.push(...events));

      if (newEvents.length > 0) {
        setAllEvents((prev) => {
          const combined = [...prev, ...newEvents];
          const unique = combined.filter(
            (event, index, self) =>
              index === self.findIndex((e) => e.id === event.id)
          );

          const now = Math.floor(Date.now() / 1000);
          const upcoming = unique.filter((event) => {
            const metadata = getEventMetadata(event);
            if (!metadata.start) return false;
            return parseInt(metadata.start) >= now;
          });

          return upcoming.sort((a, b) => {
            const aStart = getEventMetadata(a).start;
            const bStart = getEventMetadata(b).start;
            if (!aStart) return 1;
            if (!bStart) return -1;
            return parseInt(aStart) - parseInt(bStart);
          });
        });

        console.log(`Added ${newEvents.length} more events in background`);
      }
    } catch (error) {
      console.error("Background fetch error:", error);
    } finally {
      setFetchingMore(false);
    }
  }, [ndk, fetchingMore, availableTags]);

  // Initial fetch
  useEffect(() => {
    fetchAllEvents();
  }, [fetchAllEvents]);

  // Filter events based on criteria
  const filteredEvents = useMemo(() => {
    let filtered = allEvents.filter((event) => {
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

      // Location filter
      if (filters.location) {
        if (metadata.location) {
          const locationMatch = metadata.location
            .toLowerCase()
            .includes(filters.location.name.toLowerCase());
          if (!locationMatch) return false;
        } else {
          return false;
        }
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const eventTags = metadata.hashtags.map((tag) => tag.toLowerCase());
        const hasMatchingTag = filters.tags.some((filterTag: string) =>
          eventTags.includes(filterTag.toLowerCase())
        );
        if (!hasMatchingTag) return false;
      }

      // Search query filter
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const title = (metadata.title || "").toLowerCase();
        const summary = (metadata.summary || "").toLowerCase();
        const location = (metadata.location || "").toLowerCase();

        if (
          !title.includes(query) &&
          !summary.includes(query) &&
          !location.includes(query)
        ) {
          return false;
        }
      }

      return true;
    });

    return filtered;
  }, [allEvents, filters]);

  // Events to display (with pagination)
  const eventsToDisplay = filteredEvents.slice(0, displayCount);
  const hasMoreToShow = filteredEvents.length > displayCount;

  const handleFiltersChange = (newFilters: EventFiltersType) => {
    setFilters(newFilters);
    updateURL(newFilters);
    setDisplayCount(INITIAL_DISPLAY_COUNT); // Reset display count when filters change
  };

  const clearFilters = () => {
    const clearedFilters = {
      ...defaultFilters,
      dateRange: {
        start: dayjs(),
        end: dayjs().add(6, "months"),
      },
    };
    setFilters(clearedFilters);
    updateURL(clearedFilters);
    setDisplayCount(INITIAL_DISPLAY_COUNT);
  };

  const loadMore = () => {
    setDisplayCount((prev) => prev + LOAD_MORE_COUNT);
  };

  return (
    <Box sx={{ mb: 4 }}>
      {!isClient ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
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
              {!loading && (
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  ({filteredEvents.length} events)
                </Typography>
              )}
            </Typography>

            {showFilters && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {fetchingMore && (
                  <Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      Finding more...
                    </Typography>
                  </Box>
                )}
                {activeFilterCount > 0 && (
                  <Chip
                    label={`${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""}`}
                    size="small"
                    onDelete={clearFilters}
                    color="primary"
                  />
                )}
                <IconButton
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  color={filtersOpen ? "primary" : "default"}
                >
                  <FilterListIcon />
                  {filtersOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
            )}
          </Box>

          <Divider sx={{ mb: 2 }} />

          {showFilters && (
            <Collapse in={filtersOpen}>
              <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                <EventFilters
                  filters={filters}
                  onChange={handleFiltersChange}
                  availableLocations={availableLocations}
                  availableTags={availableTags}
                />
              </Paper>
            </Collapse>
          )}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ ml: 2 }}>
                Loading all upcoming events...
              </Typography>
            </Box>
          ) : eventsToDisplay.length > 0 ? (
            <>
              <Grid container spacing={3}>
                {eventsToDisplay.map((event, idx) => (
                  <Grid
                    size={{ xs: 12, md: 6 }}
                    key={`upcoming-event-${event.id}-${idx}`}
                  >
                    <EventPreviewCard event={event} />
                  </Grid>
                ))}
              </Grid>

              {hasMoreToShow && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={loadMore}
                    sx={{ minWidth: 120 }}
                  >
                    {t("events.loadMore", "Show More")} (
                    {filteredEvents.length - displayCount} remaining)
                  </Button>
                </Box>
              )}
            </>
          ) : (
            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
              sx={{ py: 4 }}
            >
              {activeFilterCount > 0
                ? t(
                    "events.noEventsWithFilters",
                    "No events found matching your filters."
                  )
                : t("events.noUpcomingEvents", "No upcoming events found.")}
            </Typography>
          )}
        </>
      )}
    </Box>
  );
};

export default UpcomingEventsSection;
