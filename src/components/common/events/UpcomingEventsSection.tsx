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

const getDefaultFilters = (): EventFiltersType => ({
  dateRange: {
    start: null, // Set to null initially to avoid hydration mismatch
    end: null, // Will be set on client side
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

// Cache for events to avoid repeated fetches
const eventCache = new Map<string, { events: NDKEvent[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const UpcomingEventsSection: React.FC<UpcomingEventsSectionProps> = ({
  title = "Upcoming Events",
  showFilters = true,
}) => {
  const { t } = useTranslation();
  const { ndk } = useNdk();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<NDKEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [filters, setFilters] = useState<EventFiltersType>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalEventPool, setTotalEventPool] = useState<NDKEvent[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // URL synchronization functions
  const filtersToURLParams = useCallback((filters: EventFiltersType) => {
    const params = new URLSearchParams();

    if (filters.searchQuery) {
      params.set("search", filters.searchQuery);
    }

    if (filters.location) {
      params.set("location", filters.location.name);
    }

    if (filters.tags.length > 0) {
      params.set("tags", filters.tags.join(","));
    }

    if (filters.dateRange.start) {
      params.set("startDate", filters.dateRange.start.format("YYYY-MM-DD"));
    }

    if (filters.dateRange.end) {
      params.set("endDate", filters.dateRange.end.format("YYYY-MM-DD"));
    }

    if (filters.batchSize !== 50) {
      params.set("batchSize", filters.batchSize.toString());
    }

    return params;
  }, []);

  const urlParamsToFilters = useCallback(
    (params: URLSearchParams): EventFiltersType => {
      const newFilters: EventFiltersType = { ...defaultFilters };

      const search = params.get("search");
      if (search) {
        newFilters.searchQuery = search;
      }

      const location = params.get("location");
      if (location) {
        newFilters.location = {
          name: location,
          coordinates: null,
          radius: 50,
        };
      }

      const tags = params.get("tags");
      if (tags) {
        newFilters.tags = tags.split(",").filter((tag) => tag.trim());
      }

      const startDate = params.get("startDate");
      if (startDate) {
        const parsed = dayjs(startDate);
        if (parsed.isValid()) {
          newFilters.dateRange.start = parsed;
        }
      }

      const endDate = params.get("endDate");
      if (endDate) {
        const parsed = dayjs(endDate);
        if (parsed.isValid()) {
          newFilters.dateRange.end = parsed;
        }
      }

      const batchSize = params.get("batchSize");
      if (batchSize) {
        const parsed = parseInt(batchSize);
        if (parsed >= 1 && parsed <= 1000) {
          newFilters.batchSize = parsed;
        }
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

      // Use replace to avoid cluttering browser history
      router.replace(newURL, { scroll: false });
    },
    [router, filtersToURLParams, isClient]
  );

  const BATCH_SIZE = filters.batchSize || 50;

  // Prevent hydration mismatch and initialize from URL
  useEffect(() => {
    setIsClient(true);

    // Initialize filters from URL
    const urlFilters = urlParamsToFilters(searchParams);

    // Set proper date range if not specified in URL
    if (!urlFilters.dateRange.start && !urlFilters.dateRange.end) {
      urlFilters.dateRange = {
        start: dayjs(),
        end: dayjs().add(3, "months"),
      };
    }

    setFilters(urlFilters);
  }, [searchParams, urlParamsToFilters]);

  // Calculate active filter count
  useEffect(() => {
    if (!isClient) return; // Don't calculate on server side

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

  // Fetch events from Nostr network with caching and background loading
  const fetchEventsBatch = useCallback(
    async (
      batchNumber: number = 0,
      appendToExisting: boolean = false,
      isBackground: boolean = false
    ) => {
      if (!ndk) return;

      // Prevent duplicate concurrent requests
      const now = Date.now();
      if (now - lastFetchTime < 1000) return; // Wait at least 1 second between requests
      setLastFetchTime(now);

      const cacheKey = `upcoming-events-${batchNumber}`;
      const cached = eventCache.get(cacheKey);

      // Check cache first (skip cache for background loading to get fresh data)
      if (
        !isBackground &&
        cached &&
        Date.now() - cached.timestamp < CACHE_DURATION
      ) {
        if (appendToExisting) {
          setEvents((prev) => [...prev, ...cached.events]);
        } else {
          setEvents(cached.events);
        }
        setLoading(false);
        setLoadingMore(false);
        return cached.events;
      }

      if (batchNumber === 0 && !isBackground) setLoading(true);
      else if (!isBackground) setLoadingMore(true);
      else setBackgroundLoading(true);

      try {
        const now = Math.floor(Date.now() / 1000);
        const sixMonthsFromNow = Math.floor(dayjs().add(6, "months").unix());
        const batchSize = isBackground ? Math.min(BATCH_SIZE, 5) : BATCH_SIZE; // Smaller batches for background

        // Enhanced strategies to find more events
        const filters: NDKFilter[] = [
          // Strategy 1: Recent events by creation time
          {
            kinds: [31922 as any, 31923 as any],
            limit: batchSize,
            until: now - batchNumber * 12 * 3600, // Go back 12 hours per batch
          },
          // Strategy 2: Search by time range (future events)
          {
            kinds: [31922 as any, 31923 as any],
            limit: batchSize,
            since: now,
            until: sixMonthsFromNow,
          },
          // Strategy 3: Popular relays with different time windows
          {
            kinds: [31922 as any, 31923 as any],
            limit: batchSize,
            until: now + batchNumber * 24 * 3600, // Look in different time windows
          },
          // Strategy 4: Search by common tags if we have available tags
          ...(availableTags.length > 0
            ? [
                {
                  kinds: [31922 as any, 31923 as any],
                  "#t": availableTags.slice(0, 5), // Search by known tags
                  limit: batchSize,
                },
              ]
            : []),
        ];

        console.log(
          `Fetching batch ${batchNumber} (background: ${isBackground}) with ${filters.length} strategies`
        );

        const allEvents: NDKEvent[] = [];

        // Fetch from multiple strategies in parallel
        const fetchPromises = filters.map(async (filter) => {
          try {
            const eventSet = await ndk.fetchEvents(filter);
            return Array.from(eventSet.values());
          } catch (error) {
            console.error("Error with filter:", filter, error);
            return [];
          }
        });

        const results = await Promise.all(fetchPromises);
        results.forEach((events) => allEvents.push(...events));

        console.log(
          `Total fetched events for batch ${batchNumber}:`,
          allEvents.length
        );

        // Remove duplicates and filter for upcoming events
        const uniqueEvents = allEvents.filter(
          (event, index, self) =>
            index === self.findIndex((e) => e.id === event.id)
        );

        const upcomingEvents = uniqueEvents.filter((event) => {
          const metadata = getEventMetadata(event);
          if (!metadata.start) return false;

          const eventStart = parseInt(metadata.start);
          return eventStart >= now && eventStart <= sixMonthsFromNow;
        });

        // Always sort by start time chronologically
        upcomingEvents.sort((a, b) => {
          const aStart = getEventMetadata(a).start;
          const bStart = getEventMetadata(b).start;
          if (!aStart) return 1;
          if (!bStart) return -1;
          return parseInt(aStart) - parseInt(bStart);
        });

        // Extract unique locations and tags from all events
        const locations = new Set<string>();
        const tags = new Set<string>();

        upcomingEvents.forEach((event) => {
          const metadata = getEventMetadata(event);
          if (metadata.location) {
            locations.add(metadata.location);
          }
          metadata.hashtags.forEach((tag) => {
            if (tag) tags.add(tag);
          });
        });

        // Update available locations and tags for filters
        setAvailableLocations((prev) => {
          const combined = [...new Set([...prev, ...Array.from(locations)])];
          return combined.sort();
        });
        setAvailableTags((prev) => {
          const combined = [...new Set([...prev, ...Array.from(tags)])];
          return combined.sort();
        });

        // Cache the results
        eventCache.set(cacheKey, {
          events: upcomingEvents,
          timestamp: Date.now(),
        });

        // Update total event pool for better filtering
        setTotalEventPool((prev) => {
          const combined = [...prev, ...upcomingEvents];
          const unique = combined.filter(
            (event, index, self) =>
              index === self.findIndex((e) => e.id === event.id)
          );
          // Keep sorted chronologically
          return unique.sort((a, b) => {
            const aStart = getEventMetadata(a).start;
            const bStart = getEventMetadata(b).start;
            if (!aStart) return 1;
            if (!bStart) return -1;
            return parseInt(aStart) - parseInt(bStart);
          });
        });

        if (!isBackground) {
          if (appendToExisting) {
            setEvents((prev) => {
              const combined = [...prev, ...upcomingEvents];
              // Remove duplicates and sort chronologically
              const unique = combined.filter(
                (event, index, self) =>
                  index === self.findIndex((e) => e.id === event.id)
              );
              return unique.sort((a, b) => {
                const aStart = getEventMetadata(a).start;
                const bStart = getEventMetadata(b).start;
                if (!aStart) return 1;
                if (!bStart) return -1;
                return parseInt(aStart) - parseInt(bStart);
              });
            });
          } else {
            setEvents(upcomingEvents);
          }

          // Always keep load more button available - there might be more events
          setHasMore(true);
        }

        return upcomingEvents;
      } catch (error) {
        console.error("Error fetching upcoming events:", error);
        if (!appendToExisting && !isBackground) {
          setEvents([]);
        }
        // Don't disable hasMore on errors - keep trying
        return [];
      } finally {
        if (!isBackground) {
          setLoading(false);
          setLoadingMore(false);
        }
        setBackgroundLoading(false);
      }
    },
    [ndk, BATCH_SIZE, lastFetchTime, availableTags]
  );

  // Initial load
  useEffect(() => {
    setCurrentBatch(0);
    fetchEventsBatch(0, false);
  }, [fetchEventsBatch]);

  // Background loading to continuously discover events
  useEffect(() => {
    if (!isClient) return;

    const backgroundLoadingInterval = setInterval(() => {
      if (!loadingMore && !loading && hasMore) {
        // Fetch in background every 30 seconds
        const nextBatch = currentBatch + 1;
        fetchEventsBatch(nextBatch, true, true); // Background loading
        setCurrentBatch(nextBatch);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(backgroundLoadingInterval);
  }, [currentBatch, loadingMore, loading, hasMore, isClient, fetchEventsBatch]);

  // Load more events
  const loadMoreEvents = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextBatch = currentBatch + 1;
      setCurrentBatch(nextBatch);
      fetchEventsBatch(nextBatch, true);
    }
  }, [currentBatch, loadingMore, hasMore, fetchEventsBatch]);

  // Filter events based on criteria - now works with totalEventPool for better results
  const filteredEvents = useMemo(() => {
    // Use the larger pool of events for filtering if available
    const eventPool =
      totalEventPool.length > events.length ? totalEventPool : events;

    let filtered = eventPool.filter((event) => {
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
          return false; // No location data, exclude if location filter is active
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

    // Always sort chronologically by start time
    filtered.sort((a, b) => {
      const aStart = getEventMetadata(a).start;
      const bStart = getEventMetadata(b).start;
      if (!aStart) return 1;
      if (!bStart) return -1;
      return parseInt(aStart) - parseInt(bStart);
    });

    return filtered.slice(0);
  }, [events, totalEventPool, filters]);

  const handleFiltersChange = (newFilters: EventFiltersType) => {
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      ...defaultFilters,
      dateRange: {
        start: dayjs(),
        end: dayjs().add(3, "months"),
      },
    };
    setFilters(clearedFilters);
    updateURL(clearedFilters);
  };

  return (
    <Box sx={{ mb: 4 }}>
      {!isClient ? (
        // Render static content during SSR
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
            </Typography>

            {showFilters && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
            </Box>
          ) : filteredEvents.length > 0 ? (
            <>
              <Grid container spacing={3}>
                {filteredEvents.map((event, idx) => (
                  <Grid
                    size={{ xs: 12, md: 6 }}
                    key={`upcoming-event-${event.id}-${idx}`}
                  >
                    <EventPreviewCard event={event} />
                  </Grid>
                ))}
              </Grid>

              {/* Load More Button - Always visible, never hide */}
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={loadMoreEvents}
                  disabled={loadingMore}
                  sx={{ minWidth: 120 }}
                >
                  {loadingMore ? (
                    <CircularProgress size={20} />
                  ) : (
                    t("events.loadMore", "Load More")
                  )}
                </Button>
                {backgroundLoading && (
                  <Box sx={{ ml: 2, display: "flex", alignItems: "center" }}>
                    <CircularProgress size={16} />
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      Finding more events...
                    </Typography>
                  </Box>
                )}
              </Box>
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
