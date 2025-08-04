// src/components/common/events/EventFilters.tsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Grid,
  TextField,
  Chip,
  Typography,
  InputAdornment,
  Autocomplete,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TagIcon from "@mui/icons-material/Tag";
import dayjs from "dayjs";

// Get user's locale for date formatting
const getUserLocale = (): string => {
  if (typeof window !== "undefined") {
    return navigator.language || navigator.languages?.[0] || "en-US";
  }
  return "en-US";
};

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
  tags: string[];
  searchQuery: string;
}

interface EventFiltersProps {
  filters: EventFilters;
  onChange: (filters: EventFilters) => void;
}

// Common hashtags for events
const POPULAR_TAGS = [
  "bitcoin",
  "nostr",
  "meetup",
  "conference",
  "workshop",
  "networking",
  "tech",
  "crypto",
  "development",
  "opensource",
  "switzerland",
  "zurich",
  "bern",
  "geneva",
  "basel",
];

// Popular locations
const POPULAR_LOCATIONS = [
  { name: "Switzerland", coordinates: [46.8182, 8.2275] as [number, number] },
  {
    name: "Zurich, Switzerland",
    coordinates: [47.3769, 8.5417] as [number, number],
  },
  {
    name: "Bern, Switzerland",
    coordinates: [46.948, 7.4474] as [number, number],
  },
  {
    name: "Geneva, Switzerland",
    coordinates: [46.2044, 6.1432] as [number, number],
  },
  {
    name: "Basel, Switzerland",
    coordinates: [47.5596, 7.5886] as [number, number],
  },
  { name: "Germany", coordinates: [51.1657, 10.4515] as [number, number] },
  { name: "Austria", coordinates: [47.5162, 14.5501] as [number, number] },
  { name: "Europe", coordinates: [54.526, 15.2551] as [number, number] },
];

const EventFilters: React.FC<EventFiltersProps> = ({ filters, onChange }) => {
  const { t } = useTranslation();
  const [tagInput, setTagInput] = useState("");
  const userLocale = getUserLocale();

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

    // Find matching location from popular locations
    const location = POPULAR_LOCATIONS.find(
      (loc) => loc.name.toLowerCase() === value.toLowerCase()
    );

    onChange({
      ...filters,
      location: location
        ? {
            name: location.name,
            coordinates: location.coordinates,
            radius: 50, // Default 50km radius
          }
        : {
            name: value,
            coordinates: null,
            radius: 50,
          },
    });
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
        Filter Events
      </Typography>

      <Grid container spacing={3}>
        {/* Search Query */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Search events"
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by title, description, or location"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Location Filter */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Autocomplete
            freeSolo
            options={POPULAR_LOCATIONS.map((loc) => loc.name)}
            value={filters.location?.name || ""}
            onChange={(_, value) => handleLocationChange(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Location"
                placeholder="Filter by location"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Date Range */}
        <Grid size={{ xs: 12, md: 6 }}>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale={userLocale}
          >
            <DatePicker
              label="Start Date"
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
          </LocalizationProvider>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale={userLocale}
          >
            <DatePicker
              label="End Date"
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
          </LocalizationProvider>
        </Grid>

        {/* Tags Filter */}
        <Grid size={12}>
          <Autocomplete
            freeSolo
            options={POPULAR_TAGS}
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
                label="Add tags"
                placeholder="Type and press Enter to add tags"
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
      </Grid>
    </Box>
  );
};

export default EventFilters;
