// src/components/common/events/EventFilters.tsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Grid,
  TextField,
  Chip,
  Typography,
  InputAdornment,
  Autocomplete,
  Slider,
  IconButton,
  Tooltip,
} from "@mui/material";
import { LocalizedDatePicker } from "@/components/common/form/LocalizedDatePicker";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TagIcon from "@mui/icons-material/Tag";
import GridViewIcon from "@mui/icons-material/GridView";
import type { dayjs } from "@/utils/formatting/dayjsConfig";
import {
  normalizeLocation,
  getAllNormalizedLocations,
  getCurrentLocation,
  type GeolocationCoordinates,
} from "@/utils/location/locationUtils";

export interface EventFilters {
  dateRange: {
    start: dayjs.Dayjs | null;
    end: dayjs.Dayjs | null;
  };
  location: {
    name: string;
    coordinates: [number, number] | null; // [lat, lng]
    radius: number; // in kilometers
  } | null;
  useGeolocation: boolean;
  userLocation: GeolocationCoordinates | null;
  tags: string[];
  searchQuery: string;
}

interface EventFiltersProps {
  filters: EventFilters;
  onChange: (filters: EventFilters) => void;
  availableLocations?: string[];
  availableTags?: string[];
  cardsPerRow?: number;
  onCardsPerRowChange?: (value: number) => void;
}

const EventFilters: React.FC<EventFiltersProps> = ({
  filters,
  onChange,
  availableLocations = [],
  availableTags = [],
  cardsPerRow,
  onCardsPerRowChange,
}) => {
  const { t } = useTranslation();
  const [tagInput, setTagInput] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [radiusTimeout, setRadiusTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Prevent hydration mismatch by only getting locale on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (radiusTimeout) {
        clearTimeout(radiusTimeout);
      }
    };
  }, [radiusTimeout]);

  // Combine normalized locations with actual event locations
  const normalizedLocations = getAllNormalizedLocations();
  const allLocations = [
    ...new Set([...normalizedLocations, ...availableLocations]),
  ].sort();

  // Combine popular tags with actual event tags
  const allTags = [...availableTags].filter(
    (tag, index, self) => self.indexOf(tag) === index
  ); // Remove duplicates

  const handleDateRangeChange = (
    field: "start" | "end",
    value: dayjs.Dayjs | null
  ) => {
    onChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value,
      },
    });
  };

  const handleLocationChange = (value: string | null) => {
    if (!value) {
      onChange({
        ...filters,
        location: null,
      });
      return;
    }

    // Normalize the location
    const normalized = normalizeLocation(value);

    onChange({
      ...filters,
      location: {
        name: normalized.normalized,
        coordinates: normalized.coordinates
          ? [normalized.coordinates.latitude, normalized.coordinates.longitude]
          : null,
        radius: filters.location?.radius || 50,
      },
    });
  };

  const handleGeolocationToggle = async (enabled: boolean) => {
    if (enabled) {
      setGettingLocation(true);
      try {
        const userLocation = await getCurrentLocation();
        onChange({
          ...filters,
          useGeolocation: true,
          userLocation,
          location: filters.location || {
            name: t("location.yourLocation", "Your Location"),
            coordinates: [userLocation.latitude, userLocation.longitude],
            radius: 50,
          },
        });
      } catch (error) {
        console.error("Error getting user location:", error);
        // Fallback to manual location selection
        onChange({
          ...filters,
          useGeolocation: false,
          userLocation: null,
        });
      } finally {
        setGettingLocation(false);
      }
    } else {
      onChange({
        ...filters,
        useGeolocation: false,
        userLocation: null,
      });
    }
  };

  const handleRadiusChange = (value: number) => {
    if (filters.location) {
      // Clear existing timeout
      if (radiusTimeout) {
        clearTimeout(radiusTimeout);
      }

      // Set new timeout to debounce the change
      const timeout = setTimeout(() => {
        onChange({
          ...filters,
          location: {
            ...filters.location!,
            radius: value,
          },
        });
      }, 300);

      setRadiusTimeout(timeout);
    }
  };

  const handleTagAdd = (tag: string) => {
    if (tag && !filters.tags.includes(tag)) {
      onChange({
        ...filters,
        tags: [...filters.tags, tag],
      });
    }
    setTagInput("");
  };

  const handleTagRemove = (tagToRemove: string) => {
    onChange({
      ...filters,
      tags: filters.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSearchChange = (value: string) => {
    onChange({
      ...filters,
      searchQuery: value,
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t("events.filters.title", "Filter Events")}
      </Typography>

      <Grid container spacing={3}>
        {/* Search Query */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label={t("events.filters.search", "Search events")}
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t(
              "events.filters.searchPlaceholder",
              "Search by title, description, or location"
            )}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Date Range */}
        <Grid size={{ xs: 12, md: 6 }}>
          {isClient ? (
            <LocalizedDatePicker
              label={t("events.filters.startDate", "Start Date")}
              value={filters.dateRange.start}
              onChange={(value) => handleDateRangeChange("start", value)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon color="primary" />
                      </InputAdornment>
                    ),
                  },
                },
              }}
            />
          ) : (
            <TextField
              fullWidth
              label={t("events.filters.startDate", "Start Date")}
              placeholder={t("events.filters.startDate", "Select start date")}
              disabled
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarTodayIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {isClient ? (
            <LocalizedDatePicker
              label={t("events.filters.endDate", "End Date")}
              value={filters.dateRange.end}
              onChange={(value) => handleDateRangeChange("end", value)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon color="primary" />
                      </InputAdornment>
                    ),
                  },
                },
              }}
            />
          ) : (
            <TextField
              fullWidth
              label={t("events.filters.endDate", "End Date")}
              placeholder={t("events.filters.endDate", "Select end date")}
              disabled
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarTodayIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          )}
        </Grid>

        {/* Tags Filter */}
        <Grid size={{ xs: 12 }}>
          <Autocomplete
            freeSolo
            options={allTags}
            value={tagInput}
            onChange={(_, value) => {
              if (value) {
                handleTagAdd(value);
              }
            }}
            onInputChange={(_, value) => setTagInput(value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && tagInput.trim()) {
                e.preventDefault();
                handleTagAdd(tagInput.trim());
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("events.filters.addTags", "Add tags")}
                placeholder={t(
                  "events.filters.tagsPlaceholder",
                  "Type and press Enter to add tags"
                )}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <TagIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          {/* Selected Tags */}
          {filters.tags.length > 0 && (
            <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
              {filters.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={`#${tag}`}
                  onDelete={() => handleTagRemove(tag)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          )}
        </Grid>

        {/* Location Filter */}
        <Grid size={{ xs: 12 }}>
          <Box>
            <Autocomplete
              freeSolo
              options={allLocations}
              value={filters.location?.name || ""}
              onChange={(_, value) => handleLocationChange(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("events.filters.location", "Location")}
                  placeholder={t(
                    "events.filters.locationPlaceholder",
                    "Filter by location"
                  )}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip
                          title={t("location.useMyLocation", "Use my location")}
                        >
                          <IconButton
                            onClick={() =>
                              handleGeolocationToggle(!filters.useGeolocation)
                            }
                            disabled={gettingLocation}
                            color={
                              filters.useGeolocation ? "primary" : "default"
                            }
                            size="small"
                          >
                            <MyLocationIcon />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            {/* Radius Slider */}
            {filters.location && (
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  px: 1,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ minWidth: "fit-content" }}
                >
                  {t("location.radius", "Radius")}: {filters.location.radius} km
                </Typography>
                <Slider
                  value={filters.location.radius}
                  onChange={(_, value) => handleRadiusChange(value as number)}
                  min={1}
                  max={200}
                  step={5}
                  size="small"
                  sx={{ flex: 1 }}
                />
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EventFilters;
