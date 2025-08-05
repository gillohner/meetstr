// src/components/common/form/CalendarReferencesField.tsx
import React, { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNdk } from "nostr-hooks";
import { type NDKEvent, type NDKFilter } from "@nostr-dev-kit/ndk";
import {
  Box,
  TextField,
  Typography,
  Card,
  CardContent,
  IconButton,
  Autocomplete,
  Chip,
  CircularProgress,
  Avatar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { getEventMetadata } from "@/utils/nostr/eventUtils";
import { nip19 } from "nostr-tools";

// Simple naddr parser
const parseNaddr = (input: string) => {
  try {
    if (input.startsWith("naddr")) {
      const decoded = nip19.decode(input);
      if (decoded.type === "naddr") {
        return {
          kind: decoded.data.kind,
          pubkey: decoded.data.pubkey,
          identifier: decoded.data.identifier,
        };
      }
    } else if (input.includes("/calendar/")) {
      const match = input.match(/\/calendar\/(.+)$/);
      if (match) {
        return parseNaddr(match[1]);
      }
    }
  } catch (error) {
    console.error("Error parsing naddr:", error);
  }
  return null;
};

export interface CalendarReference {
  aTag: string; // "31924:pubkey:dTag"
  naddr: string; // For display
  calendar: NDKEvent | null; // Fetched calendar data
}

interface CalendarReferencesFieldProps {
  label: string;
  value: CalendarReference[];
  onChange: (refs: CalendarReference[]) => void;
  placeholder?: string;
  maxHeight?: number;
  showRemoveInPreview?: boolean;
}

const CalendarReferencesField: React.FC<CalendarReferencesFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = "Search calendars or paste naddr...",
  maxHeight = 300,
  showRemoveInPreview = false,
}) => {
  const { t } = useTranslation();
  const { ndk } = useNdk();
  const [inputValue, setInputValue] = useState("");
  const [searchResults, setSearchResults] = useState<NDKEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Search calendars
  const searchCalendars = useCallback(
    async (query: string) => {
      if (!ndk || query.length < 2) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const filters: NDKFilter[] = [
          {
            kinds: [31924 as any],
            limit: 20,
            search: query,
          },
          // Also search by recent calendars
          {
            kinds: [31924 as any],
            limit: 10,
          },
        ];

        const allResults: NDKEvent[] = [];
        for (const filter of filters) {
          try {
            const events = await ndk.fetchEvents(filter);
            allResults.push(...Array.from(events.values()));
          } catch (error) {
            console.error("Error fetching calendars:", error);
          }
        }

        // Remove duplicates and filter by search term
        const unique = allResults.filter(
          (calendar, index, self) =>
            index === self.findIndex((c) => c.id === calendar.id)
        );

        const filtered = unique.filter((calendar) => {
          const metadata = getEventMetadata(calendar);
          const title = metadata.title?.toLowerCase() || "";
          const summary = metadata.summary?.toLowerCase() || "";
          const searchTerm = query.toLowerCase();

          return title.includes(searchTerm) || summary.includes(searchTerm);
        });

        setSearchResults(filtered.slice(0, 10));
      } catch (error) {
        console.error("Calendar search error:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    },
    [ndk]
  );

  // Handle input change with debouncing
  const handleInputChange = useCallback(
    (newValue: string) => {
      setInputValue(newValue);

      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Try to parse as naddr first
      if (newValue.startsWith("naddr") || newValue.includes("/calendar/")) {
        return; // Let user finish typing
      }

      const timeout = setTimeout(() => {
        searchCalendars(newValue);
      }, 300);

      setSearchTimeout(timeout);
    },
    [searchCalendars, searchTimeout]
  );

  // Add calendar reference
  const addCalendarReference = useCallback(
    async (calendar: NDKEvent | null, inputText?: string) => {
      let aTag: string;
      let naddr: string;

      if (calendar) {
        // From search result
        const dTag = calendar.tags.find((t) => t[0] === "d")?.[1] || "";
        aTag = `31924:${calendar.pubkey}:${dTag}`;
        try {
          naddr = nip19.naddrEncode({
            kind: 31924,
            pubkey: calendar.pubkey,
            identifier: dTag,
          });
        } catch {
          naddr = aTag;
        }
      } else if (inputText) {
        // From manual input (naddr or meetstr URL)
        const parsed = parseNaddr(inputText);
        if (parsed && parsed.kind === 31924) {
          aTag = `31924:${parsed.pubkey}:${parsed.identifier || ""}`;
          naddr = inputText.startsWith("naddr") ? inputText : "";
        } else {
          return; // Invalid input
        }
      } else {
        return;
      }

      // Check for duplicates
      const exists = value.some((ref) => ref.aTag === aTag);
      if (exists) return;

      const newRef: CalendarReference = {
        aTag,
        naddr,
        calendar,
      };

      onChange([...value, newRef]);
      setInputValue("");
      setSearchResults([]);
    },
    [value, onChange]
  );

  // Handle selection from autocomplete
  const handleSelection = useCallback(
    (calendar: NDKEvent | null) => {
      if (calendar) {
        addCalendarReference(calendar);
      } else if (inputValue.trim()) {
        // Try to add as naddr
        addCalendarReference(null, inputValue.trim());
      }
    },
    [addCalendarReference, inputValue]
  );

  // Handle manual input (Enter key)
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" && inputValue.trim()) {
        event.preventDefault();
        addCalendarReference(null, inputValue.trim());
      }
    },
    [addCalendarReference, inputValue]
  );

  // Remove reference
  const removeReference = useCallback(
    (indexToRemove: number) => {
      onChange(value.filter((_, index) => index !== indexToRemove));
    },
    [onChange, value]
  );

  // Prepare options for autocomplete
  const options = useMemo(() => {
    return searchResults.filter(
      (calendar) =>
        !value.some((ref) => {
          const dTag = calendar.tags.find((t) => t[0] === "d")?.[1] || "";
          const calendarATag = `31924:${calendar.pubkey}:${dTag}`;
          return ref.aTag === calendarATag;
        })
    );
  }, [searchResults, value]);

  return (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: "flex", alignItems: "center" }}
      >
        <CalendarMonthIcon sx={{ mr: 1 }} color="primary" />
        {label}
      </Typography>

      <Autocomplete
        options={options}
        loading={loading}
        inputValue={inputValue}
        onInputChange={(_, newValue) => handleInputChange(newValue)}
        onChange={(_, newValue) => {
          if (typeof newValue === "string") {
            // Handle free solo text input
            handleSelection(null);
          } else {
            handleSelection(newValue as NDKEvent | null);
          }
        }}
        getOptionLabel={(calendar) => {
          if (typeof calendar === "string") return calendar;
          const metadata = getEventMetadata(calendar);
          return metadata.title || "Untitled Calendar";
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            variant="outlined"
            fullWidth
            onKeyDown={handleKeyDown}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, calendar) => {
          if (typeof calendar === "string") return null;
          const metadata = getEventMetadata(calendar);
          return (
            <Box
              component="li"
              {...props}
              sx={{ display: "flex", alignItems: "center", gap: 2 }}
            >
              {metadata.image ? (
                <Avatar src={metadata.image} sx={{ width: 32, height: 32 }} />
              ) : (
                <Avatar sx={{ width: 32, height: 32 }}>
                  <CalendarMonthIcon fontSize="small" />
                </Avatar>
              )}
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap>
                  {metadata.title || "Untitled Calendar"}
                </Typography>
                {metadata.summary && (
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {metadata.summary}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        }}
        freeSolo
        clearOnBlur={false}
        clearOnEscape
        noOptionsText={
          inputValue.length < 2
            ? "Type to search calendars..."
            : "No calendars found"
        }
      />

      {/* Preview selected calendars */}
      {value.length > 0 && (
        <Box sx={{ mt: 2, maxHeight, overflow: "auto" }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Calendars ({value.length})
          </Typography>
          {value.map((ref, index) => {
            const metadata = ref.calendar
              ? getEventMetadata(ref.calendar)
              : null;
            return (
              <Card key={ref.aTag} variant="outlined" sx={{ mb: 1 }}>
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {metadata?.image ? (
                      <Avatar
                        src={metadata.image}
                        sx={{ width: 40, height: 40 }}
                      />
                    ) : (
                      <Avatar sx={{ width: 40, height: 40 }}>
                        <CalendarMonthIcon />
                      </Avatar>
                    )}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" noWrap>
                        {metadata?.title || ref.naddr}
                      </Typography>
                      {metadata?.summary && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                        >
                          {metadata.summary}
                        </Typography>
                      )}
                    </Box>
                    {showRemoveInPreview && (
                      <IconButton
                        size="small"
                        onClick={() => removeReference(index)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default CalendarReferencesField;
