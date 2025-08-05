// src/components/common/form/NostrEntitySearchField.tsx
"use client";
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
  CircularProgress,
  Avatar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EventIcon from "@mui/icons-material/Event";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { getEventMetadata } from "@/utils/nostr/eventUtils";
import { nip19 } from "nostr-tools";

// Parse naddr or meetstr URL
const parseNostrReference = (input: string) => {
  try {
    // Handle naddr directly
    if (input.startsWith("naddr")) {
      const decoded = nip19.decode(input);
      if (decoded.type === "naddr") {
        return {
          kind: decoded.data.kind,
          pubkey: decoded.data.pubkey,
          identifier: decoded.data.identifier,
        };
      }
    }

    // Handle meetstr URLs
    if (input.includes("/event/") || input.includes("/calendar/")) {
      const match = input.match(/\/(event|calendar)\/(.+)$/);
      if (match) {
        return parseNostrReference(match[2]);
      }
    }
  } catch (error) {
    console.error("Error parsing nostr reference:", error);
  }
  return null;
};

export interface NostrReference {
  aTag: string; // "kind:pubkey:dTag"
  naddr: string; // For display
  entity: NDKEvent | null; // Fetched entity data
}

interface NostrEntitySearchFieldProps {
  label: string;
  value: NostrReference[];
  onChange: (refs: NostrReference[]) => void;
  placeholder?: string;
  maxHeight?: number;
  showRemoveInPreview?: boolean;
  allowedKinds: number[]; // e.g., [31922, 31923] for events, [31924] for calendars
  icon?: React.ReactNode;
}

const NostrEntitySearchField: React.FC<NostrEntitySearchFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = "Search or paste naddr...",
  maxHeight = 300,
  showRemoveInPreview = false,
  allowedKinds,
  icon,
}) => {
  const { t } = useTranslation();
  const { ndk } = useNdk();
  const [inputValue, setInputValue] = useState("");
  const [searchResults, setSearchResults] = useState<NDKEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Determine entity type for display
  const isCalendar = allowedKinds.includes(31924);
  const isEvent = allowedKinds.includes(31922) || allowedKinds.includes(31923);

  // Search entities
  const searchEntities = useCallback(
    async (query: string) => {
      if (!ndk || query.length < 2) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        // Enhanced search strategies similar to UpcomingEventsSection
        const now = Math.floor(Date.now() / 1000);
        const sixMonthsFromNow =
          Math.floor(Date.now() / 1000) + 6 * 30 * 24 * 3600;

        const filters: NDKFilter[] = [
          // Strategy 1: Search by content/metadata
          {
            kinds: allowedKinds as any[],
            limit: 20,
            search: query,
          },
          // Strategy 2: Recent entities
          {
            kinds: allowedKinds as any[],
            limit: 15,
            until: now,
          },
        ];

        // Strategy 3: For events, also search by time range
        if (isEvent) {
          filters.push({
            kinds: allowedKinds as any[],
            limit: 10,
            since: now,
            until: sixMonthsFromNow,
          });
        }

        const allResults: NDKEvent[] = [];

        // Fetch from multiple strategies in parallel
        const fetchPromises = filters.map(async (filter) => {
          try {
            const eventSet = await ndk.fetchEvents(filter);
            return Array.from(eventSet.values());
          } catch (error) {
            console.error("Error fetching entities:", error);
            return [];
          }
        });

        const results = await Promise.all(fetchPromises);
        results.forEach((entities) => allResults.push(...entities));

        // Remove duplicates
        const unique = allResults.filter(
          (entity, index, self) =>
            index === self.findIndex((e) => e.id === entity.id)
        );

        // Filter by search term
        const filtered = unique.filter((entity) => {
          const metadata = getEventMetadata(entity);
          const title = metadata.title?.toLowerCase() || "";
          const summary = metadata.summary?.toLowerCase() || "";
          const location = metadata.location?.toLowerCase() || "";
          const searchTerm = query.toLowerCase();

          return (
            title.includes(searchTerm) ||
            summary.includes(searchTerm) ||
            location.includes(searchTerm)
          );
        });

        setSearchResults(filtered.slice(0, 15));
      } catch (error) {
        console.error("Entity search error:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    },
    [ndk, allowedKinds, isEvent]
  );

  // Handle input change with debouncing
  const handleInputChange = useCallback(
    (newValue: string) => {
      setInputValue(newValue);

      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Check if it's a nostr reference (naddr or URL)
      const parsed = parseNostrReference(newValue);
      if (parsed && allowedKinds.includes(parsed.kind)) {
        // It's a valid reference, don't search
        return;
      }

      // Debounced search for text queries
      const timeout = setTimeout(() => {
        searchEntities(newValue);
      }, 300);

      setSearchTimeout(timeout);
    },
    [searchEntities, searchTimeout, allowedKinds]
  );

  // Add entity reference
  const addEntityReference = useCallback(
    async (entity: NDKEvent | null, inputText?: string) => {
      let aTag: string;
      let naddr: string;

      if (entity) {
        // From search result
        const dTag = entity.tags.find((t) => t[0] === "d")?.[1] || "";
        aTag = `${entity.kind}:${entity.pubkey}:${dTag}`;
        try {
          naddr = nip19.naddrEncode({
            kind: entity.kind as any,
            pubkey: entity.pubkey,
            identifier: dTag,
          });
        } catch {
          naddr = aTag;
        }
      } else if (inputText) {
        // From manual input (naddr or URL)
        const parsed = parseNostrReference(inputText);
        if (parsed && allowedKinds.includes(parsed.kind)) {
          aTag = `${parsed.kind}:${parsed.pubkey}:${parsed.identifier || ""}`;
          naddr = inputText.startsWith("naddr") ? inputText : aTag;

          // Try to fetch the entity for better display
          try {
            const filter: NDKFilter = {
              kinds: [parsed.kind as any],
              authors: [parsed.pubkey],
              "#d": parsed.identifier ? [parsed.identifier] : undefined,
              limit: 1,
            };
            const events = await ndk?.fetchEvents(filter);
            entity = events?.values().next().value || null;
          } catch (error) {
            console.error("Error fetching entity:", error);
          }
        } else {
          return; // Invalid input
        }
      } else {
        return;
      }

      // Check for duplicates
      const exists = value.some((ref) => ref.aTag === aTag);
      if (exists) return;

      const newRef: NostrReference = {
        aTag,
        naddr,
        entity,
      };

      onChange([...value, newRef]);
      setInputValue("");
      setSearchResults([]);
    },
    [value, onChange, allowedKinds, ndk]
  );

  // Handle selection from autocomplete
  const handleSelection = useCallback(
    (entity: NDKEvent | null) => {
      if (entity) {
        addEntityReference(entity);
      } else if (inputValue.trim()) {
        // Try to add as naddr/URL
        addEntityReference(null, inputValue.trim());
      }
    },
    [addEntityReference, inputValue]
  );

  // Handle manual input (Enter key)
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" && inputValue.trim()) {
        event.preventDefault();
        addEntityReference(null, inputValue.trim());
      }
    },
    [addEntityReference, inputValue]
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
      (entity) =>
        !value.some((ref) => {
          const dTag = entity.tags.find((t) => t[0] === "d")?.[1] || "";
          const entityATag = `${entity.kind}:${entity.pubkey}:${dTag}`;
          return ref.aTag === entityATag;
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
        {icon ||
          (isCalendar ? (
            <CalendarMonthIcon sx={{ mr: 1 }} color="primary" />
          ) : (
            <EventIcon sx={{ mr: 1 }} color="primary" />
          ))}
        {label}
      </Typography>

      <Autocomplete
        options={options}
        loading={loading}
        inputValue={inputValue}
        onInputChange={(_, newValue) => handleInputChange(newValue)}
        onChange={(_, newValue) => {
          if (typeof newValue === "string") {
            handleSelection(null);
          } else {
            handleSelection(newValue as NDKEvent | null);
          }
        }}
        getOptionLabel={(entity) => {
          if (typeof entity === "string") return entity;
          const metadata = getEventMetadata(entity);
          return (
            metadata.title || `Untitled ${isCalendar ? "Calendar" : "Event"}`
          );
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
        renderOption={(props, entity) => {
          if (typeof entity === "string") return null;
          const metadata = getEventMetadata(entity);
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
                  {isCalendar ? (
                    <CalendarMonthIcon fontSize="small" />
                  ) : (
                    <EventIcon fontSize="small" />
                  )}
                </Avatar>
              )}
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap>
                  {metadata.title ||
                    `Untitled ${isCalendar ? "Calendar" : "Event"}`}
                </Typography>
                {metadata.summary && (
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {metadata.summary}
                  </Typography>
                )}
                {metadata.location && (
                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                    noWrap
                  >
                    📍 {metadata.location}
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
            ? `Type to search ${isCalendar ? "calendars" : "events"}...`
            : `No ${isCalendar ? "calendars" : "events"} found`
        }
      />

      {/* Preview selected entities */}
      {value.length > 0 && (
        <Box sx={{ mt: 2, maxHeight, overflow: "auto" }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected {isCalendar ? "Calendars" : "Events"} ({value.length})
          </Typography>
          {value.map((ref, index) => {
            const metadata = ref.entity ? getEventMetadata(ref.entity) : null;
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
                        {isCalendar ? <CalendarMonthIcon /> : <EventIcon />}
                      </Avatar>
                    )}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" noWrap>
                        {metadata?.title || ref.naddr || ref.aTag}
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
                      {metadata?.location && (
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                          noWrap
                        >
                          📍 {metadata.location}
                        </Typography>
                      )}
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                        sx={{ fontFamily: "monospace" }}
                      >
                        {ref.aTag}
                      </Typography>
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

export default NostrEntitySearchField;
