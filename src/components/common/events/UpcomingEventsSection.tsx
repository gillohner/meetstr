"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNdk } from "nostr-hooks";
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
  batchSize: 10,
});

const defaultFilters: EventFiltersType = getDefaultFilters();

interface UpcomingEventsSectionProps {
  title?: string;
  maxEvents?: number;
  showFilters?: boolean;
}

// Cache for events to avoid repeated fetches
const eventCache = new Map<string, { events: NDKEvent[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const UpcomingEventsSection: React.FC<UpcomingEventsSectionProps> = ({
  title = "Upcoming Events",
  maxEvents = 50,
  showFilters = true,
}) => {
  const { t } = useTranslation();
  const { ndk } = useNdk();
  const [events, setEvents] = useState<NDKEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filters, setFilters] = useState<EventFiltersType>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
    // Set proper date range on client side to avoid hydration mismatch
    if (filters.dateRange.start === null && filters.dateRange.end === null) {
      setFilters((prev) => ({
        ...prev,
        dateRange: {
          start: dayjs(),
          end: dayjs().add(3, "months"),
        },
      }));
    }
  }, []);

  const BATCH_SIZE = filters.batchSize || 10;

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

  // Fetch events from Nostr network with caching
  const fetchEventsBatch = useCallback(
    async (batchNumber: number = 0, appendToExisting: boolean = false) => {
      if (!ndk) return;

      const cacheKey = `upcoming-events-${batchNumber}`;
      const cached = eventCache.get(cacheKey);

      // Check cache first
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        if (appendToExisting) {
          setEvents((prev) => [...prev, ...cached.events]);
        } else {
          setEvents(cached.events);
        }
        setLoading(false);
        setLoadingMore(false);
        return cached.events;
      }

      if (batchNumber === 0) setLoading(true);
      else setLoadingMore(true);

      try {
        const now = Math.floor(Date.now() / 1000);
        const threeMonthsFromNow = Math.floor(dayjs().add(3, "months").unix());

        // Use multiple strategies to find events
        const filters: NDKFilter[] = [
          // Strategy 1: Recent events (most likely to find active events)
          {
            kinds: [31922 as any, 31923 as any],
            limit: BATCH_SIZE,
            until: now + batchNumber * 24 * 3600, // Look back in time
          },
          // Strategy 2: Events with start time in the future
          {
            kinds: [31922 as any, 31923 as any],
            limit: BATCH_SIZE / 2,
          },
        ];

        console.log("Fetching events with filters:", filters);

        const allEvents: NDKEvent[] = [];

        // Fetch from multiple strategies
        for (const filter of filters) {
          try {
            const eventSet = await ndk.fetchEvents(filter);
            const events = Array.from(eventSet.values());
            allEvents.push(...events);
          } catch (error) {
            console.error("Error with filter:", filter, error);
          }
        }

        console.log("Total fetched events:", allEvents.length);

        // Remove duplicates and filter for upcoming events
        const uniqueEvents = allEvents.filter(
          (event, index, self) =>
            index === self.findIndex((e) => e.id === event.id)
        );

        const upcomingEvents = uniqueEvents.filter((event) => {
          const metadata = getEventMetadata(event);
          if (!metadata.start) return false;

          const eventStart = parseInt(metadata.start);
          return eventStart >= now && eventStart <= threeMonthsFromNow;
        });

        // Sort by start time
        upcomingEvents.sort((a, b) => {
          const aStart = getEventMetadata(a).start;
          const bStart = getEventMetadata(b).start;
          if (!aStart) return 1;
          if (!bStart) return -1;
          return parseInt(aStart) - parseInt(bStart);
        });

        // Extract unique locations and tags from events for filter options
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
        if (batchNumber === 0) {
          setAvailableLocations(Array.from(locations));
          setAvailableTags(Array.from(tags));
        } else {
          setAvailableLocations((prev) => [
            ...new Set([...prev, ...Array.from(locations)]),
          ]);
          setAvailableTags((prev) => [
            ...new Set([...prev, ...Array.from(tags)]),
          ]);
        }

        // Cache the results
        eventCache.set(cacheKey, {
          events: upcomingEvents,
          timestamp: Date.now(),
        });

        if (appendToExisting) {
          setEvents((prev) => {
            const combined = [...prev, ...upcomingEvents];
            // Remove duplicates based on event id
            const unique = combined.filter(
              (event, index, self) =>
                index === self.findIndex((e) => e.id === event.id)
            );
            return unique;
          });
        } else {
          setEvents(upcomingEvents);
        }

        // Check if we have more events to load
        setHasMore(upcomingEvents.length === BATCH_SIZE);

        return upcomingEvents;
      } catch (error) {
        console.error("Error fetching upcoming events:", error);
        if (!appendToExisting) {
          setEvents([]);
        }
        setHasMore(false);
        return [];
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [ndk]
  );

  // Initial load
  useEffect(() => {
    setCurrentBatch(0);
    fetchEventsBatch(0, false);
  }, [fetchEventsBatch]);

  // Load more events
  const loadMoreEvents = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextBatch = currentBatch + 1;
      setCurrentBatch(nextBatch);
      fetchEventsBatch(nextBatch, true);
    }
  }, [currentBatch, loadingMore, hasMore, fetchEventsBatch]);

  // Filter events based on criteria
  const filteredEvents = useMemo(() => {
    let filtered = events.filter((event) => {
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

    return filtered.slice(0, maxEvents);
  }, [events, filters, maxEvents]);

  const handleFiltersChange = (newFilters: EventFiltersType) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <Box sx={{ mb: 4 }}>
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
                size={{ xs: 12, md: 6, lg: 4 }}
                key={`upcoming-event-${event.id}-${idx}`}
              >
                <EventPreviewCard event={event} />
              </Grid>
            ))}
          </Grid>

          {/* Load More Button - Always show when there are more events available */}
          {hasMore && (
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
    </Box>
  );
};

export default UpcomingEventsSection;
