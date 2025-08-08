"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNdk } from "nostr-hooks";
import { type NDKEvent, type NDKFilter } from "@nostr-dev-kit/ndk";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { getEventMetadata } from "@/utils/nostr/eventUtils";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  filterDeletedEvents,
  filterDeletedEventsUltraFast,
} from "@/utils/nostr/deletionUtils";
import {
  fetchEvents,
  calculateCalendarEventCounts,
} from "@/utils/nostr/eventCacheUtils";
import { fetchCalendarEvents } from "@/utils/nostr/nostrUtils";
import CalendarPreviewCard from "@/components/common/calendar/CalendarPreviewCard";

// Calendar cache for faster loading
const calendarCache = new Map<
  string,
  { calendars: NDKEvent[]; timestamp: number }
>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const CALENDAR_CACHE_KEY = "calendars-cache";

const getCachedCalendars = (): NDKEvent[] | null => {
  const cached = calendarCache.get(CALENDAR_CACHE_KEY);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.calendars;
  }
  return null;
};

const cacheCalendars = (calendars: NDKEvent[]) => {
  calendarCache.set(CALENDAR_CACHE_KEY, {
    calendars: [...calendars],
    timestamp: Date.now(),
  });
};

const PopularCalendars: React.FC = () => {
  const { ndk } = useNdk();
  const [calendars, setCalendars] = useState<NDKEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [hideEmpty, setHideEmpty] = useState(true);
  const [calendarCounts, setCalendarCounts] = useState<
    Map<string, { upcoming: number; past: number }>
  >(new Map());
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down("sm"));

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);

    // Check cache first
    const cachedCalendars = getCachedCalendars();
    if (cachedCalendars && cachedCalendars.length > 0) {
      console.log("Loading calendars from cache");
      setCalendars(cachedCalendars);
      setLoading(false);
    }
  }, []);

  // Fetch calendars with higher limits
  const fetchCalendars = useCallback(async () => {
    if (!ndk) return;

    console.log("🗓️ Fetching calendars...");

    // Don't show loading if we have cached calendars
    const hasCached = getCachedCalendars();
    if (!hasCached) {
      setLoading(true);
    }

    try {
      // Fetch with much higher limits to get more calendars
      const filter: NDKFilter = {
        kinds: [31924 as any], // Calendar kind
        limit: 500, // Increased from 30 to 500
      };

      const events = await ndk.fetchEvents(filter);
      const calendarArray = Array.from(events.values()) as NDKEvent[];

      console.log(`📅 Found ${calendarArray.length} calendars`);

      // Filter out deleted calendars using ultra-fast batch deletion checking
      const activeCalendars = await filterDeletedEventsUltraFast(
        ndk,
        calendarArray
      );
      console.log(`📅 ${activeCalendars.length} active calendars`);

      // Sort by popularity (number of 'a' tags = number of events)
      const sorted = activeCalendars.sort((a: NDKEvent, b: NDKEvent) => {
        const aCount = a.tags.filter((t: any) => t[0] === "a").length;
        const bCount = b.tags.filter((t: any) => t[0] === "a").length;
        return bCount - aCount;
      });

      setCalendars(sorted);
      cacheCalendars(sorted);

      // Use optimized batch event fetching
      try {
        console.log("🚀 Starting optimized event counting...");

        const { allEvents } = await fetchEvents(ndk);
        console.log(`📊 Got ${allEvents.length} events for counting`);

        // Calculate event counts efficiently
        const counts = calculateCalendarEventCounts(sorted, allEvents);
        setCalendarCounts(counts);

        console.log(`📊 Calculated event counts for ${counts.size} calendars`);
      } catch (error) {
        console.error("Error in optimized event counting:", error);
        // Fallback: use the actual fetchCalendarEvents for accurate counts
        const fallbackCounts = new Map<
          string,
          { upcoming: number; past: number }
        >();

        const countPromises = sorted
          .slice(0, 48)
          .map(async (calendar: NDKEvent) => {
            try {
              const { upcoming, past } = await fetchCalendarEvents(
                ndk,
                calendar
              );

              fallbackCounts.set(calendar.id, {
                upcoming: upcoming.length,
                past: past.length,
              });
            } catch (error) {
              console.error(
                `Error fetching events for calendar ${calendar.id}:`,
                error
              );
              // As last resort, estimate from total event count
              const totalEvents = calendar.tags.filter(
                (t: any) => t[0] === "a"
              ).length;
              fallbackCounts.set(calendar.id, {
                upcoming: Math.floor(totalEvents * 0.7),
                past: Math.floor(totalEvents * 0.3),
              });
            }
          });

        await Promise.all(countPromises);
        setCalendarCounts(fallbackCounts);
      }
    } catch (error) {
      console.error("Error fetching calendars:", error);
      setCalendars([]);
    } finally {
      setLoading(false);
    }
  }, [ndk]);

  // Load calendars when NDK is ready
  useEffect(() => {
    if (ndk && isClient) {
      fetchCalendars();
    }
  }, [ndk, isClient, fetchCalendars]);

  // Filter calendars based on search query and hideEmpty setting
  const filteredCalendars = useMemo(() => {
    let filtered = calendars;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((calendar) => {
        const metadata = getEventMetadata(calendar);
        const searchableText = [metadata.title, metadata.summary]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      });
    }

    // Apply hideEmpty filter
    if (hideEmpty) {
      filtered = filtered.filter((calendar) => {
        const counts = calendarCounts.get(calendar.id);
        return counts && counts.upcoming > 0;
      });
    }

    return filtered.slice(0, 48); // Show up to 48 calendars
  }, [calendars, searchQuery, hideEmpty, calendarCounts]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  if (!isClient) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress aria-label={t("common.loading")} />
      </Box>
    );
  }

  if (!calendars.length) {
    return (
      <Typography sx={{ my: 4 }} align="center">
        {t("calendar.noCalendarsFound", "No calendars found.")}
      </Typography>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      {/* Search Bar and Filter */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          placeholder={t("calendar.searchCalendars", "Search calendars...")}
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  aria-label="clear search"
                  onClick={handleClearSearch}
                  edge="end"
                  size="small"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={hideEmpty}
              onChange={(e) => setHideEmpty(e.target.checked)}
              color="primary"
            />
          }
          label={t(
            "calendar.hideEmpty",
            "Hide calendars with no upcoming events"
          )}
        />
      </Paper>

      {/* Results Info */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {searchQuery
          ? t(
              "calendar.searchResults",
              'Found {{count}} calendars matching "{{query}}"',
              {
                count: filteredCalendars.length,
                query: searchQuery,
              }
            )
          : t("calendar.totalCalendars", "Showing {{count}} calendars", {
              count: filteredCalendars.length,
            })}
      </Typography>

      {/* Calendar Grid */}
      {filteredCalendars.length > 0 ? (
        <Grid container spacing={3}>
          {filteredCalendars.map((calendar) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={calendar.id}>
              <CalendarPreviewCard
                calendar={calendar}
                eventCounts={calendarCounts.get(calendar.id)}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" align="center" sx={{ py: 4 }}>
          {t(
            "calendar.noSearchResults",
            "No calendars found matching your search."
          )}
        </Typography>
      )}
    </Box>
  );
};

export default PopularCalendars;
