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
import dayjs from "dayjs";

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
  const [loadingEntities, setLoadingEntities] = useState<Set<string>>(
    new Set()
  );
  const [loadedEntities, setLoadedEntities] = useState<Set<string>>(new Set());
  const currentValueRef = React.useRef<NostrReference[]>(value);

  // Keep ref up to date
  React.useEffect(() => {
    currentValueRef.current = value;
  }, [value]);

  // Determine entity type for display
  const isCalendar = allowedKinds.includes(31924);
  const isEvent = allowedKinds.includes(31922) || allowedKinds.includes(31923);

  // Batch load missing entity data for existing references
  const batchLoadEntities = useCallback(
    async (refs: NostrReference[]) => {
      if (!ndk) return;

      // Filter out entities that are already loaded or currently loading
      const refsToLoad = refs.filter(
        (ref) =>
          !ref.entity &&
          !loadingEntities.has(ref.aTag) &&
          !loadedEntities.has(ref.aTag)
      );

      if (refsToLoad.length === 0) return;

      console.log(`Batch loading ${refsToLoad.length} entities`);

      // Mark all as loading
      setLoadingEntities((prev) => {
        const newSet = new Set(prev);
        refsToLoad.forEach((ref) => newSet.add(ref.aTag));
        return newSet;
      });

      try {
        // Create filters for batch loading
        const filtersByKind = new Map<
          number,
          { pubkeys: string[]; identifiers: string[]; refs: NostrReference[] }
        >();

        refsToLoad.forEach((ref) => {
          const [kind, pubkey, identifier] = ref.aTag.split(":");
          const kindNum = parseInt(kind);

          if (!filtersByKind.has(kindNum)) {
            filtersByKind.set(kindNum, {
              pubkeys: [],
              identifiers: [],
              refs: [],
            });
          }

          const kindData = filtersByKind.get(kindNum)!;
          kindData.pubkeys.push(pubkey);
          if (identifier) {
            kindData.identifiers.push(identifier);
          }
          kindData.refs.push(ref);
        });

        // Fetch entities by kind in batches
        const fetchPromises = Array.from(filtersByKind.entries()).map(
          async ([kind, data]) => {
            try {
              const filter: NDKFilter = {
                kinds: [kind as any],
                authors: data.pubkeys,
                ...(data.identifiers.length > 0 && { "#d": data.identifiers }),
                limit: data.refs.length,
              };

              const events = await ndk.fetchEvents(filter);
              return {
                kind,
                events: Array.from(events.values()),
                refs: data.refs,
              };
            } catch (error) {
              console.error(`Error fetching entities for kind ${kind}:`, error);
              return { kind, events: [], refs: data.refs };
            }
          }
        );

        const results = await Promise.all(fetchPromises);

        // Map fetched events to references
        const updatedRefs = new Map<string, NDKEvent>();

        results.forEach(({ events, refs }) => {
          refs.forEach((ref) => {
            const [, pubkey, identifier] = ref.aTag.split(":");
            const matchingEvent = events.find((event) => {
              const eventDTag = event.tags.find((t) => t[0] === "d")?.[1] || "";
              return event.pubkey === pubkey && eventDTag === identifier;
            });

            if (matchingEvent) {
              updatedRefs.set(ref.aTag, matchingEvent);
            }
          });
        });

        // Update the value array with loaded entities
        if (updatedRefs.size > 0) {
          // Use ref to get current value at time of update to avoid stale closure
          const newValue = currentValueRef.current.map((ref) => {
            const loadedEntity = updatedRefs.get(ref.aTag);
            if (loadedEntity) {
              // Generate proper naddr for the loaded entity
              const dTag =
                loadedEntity.tags.find((t) => t[0] === "d")?.[1] || "";
              let naddr = ref.naddr;

              // Generate naddr if not available or invalid
              if (!naddr || !naddr.startsWith("naddr")) {
                try {
                  naddr = nip19.naddrEncode({
                    kind: loadedEntity.kind as any,
                    pubkey: loadedEntity.pubkey,
                    identifier: dTag,
                  });
                } catch (error) {
                  console.error(
                    "Error generating naddr for loaded entity:",
                    error
                  );
                  naddr = ref.aTag;
                }
              }

              return { ...ref, entity: loadedEntity, naddr };
            }
            return ref;
          });
          onChange(newValue);
        }

        // Mark entities as loaded (whether successful or not)
        setLoadedEntities((prev) => {
          const newSet = new Set(prev);
          refsToLoad.forEach((ref) => newSet.add(ref.aTag));
          return newSet;
        });

        console.log(
          `Batch loaded ${updatedRefs.size}/${refsToLoad.length} entities`
        );
      } catch (error) {
        console.error("Batch loading error:", error);
      } finally {
        // Remove from loading state
        setLoadingEntities((prev) => {
          const newSet = new Set(prev);
          refsToLoad.forEach((ref) => newSet.delete(ref.aTag));
          return newSet;
        });
      }
    },
    [ndk, onChange] // Remove value, loadingEntities, loadedEntities to prevent infinite loop
  );

  // Load entity data for existing references on mount and when new refs are added
  React.useEffect(() => {
    const refsNeedingLoad = value.filter(
      (ref) => !ref.entity && !loadedEntities.has(ref.aTag)
    );

    if (refsNeedingLoad.length > 0) {
      // Debounce the batch loading to avoid excessive API calls
      const timeoutId = setTimeout(() => {
        batchLoadEntities(refsNeedingLoad);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [value.map((ref) => ref.aTag).join(","), loadedEntities]); // Remove batchLoadEntities from deps to prevent infinite loop

  // Generate URL for entity
  const getEntityUrl = useCallback(
    (ref: NostrReference) => {
      const entityType = isCalendar ? "calendar" : "event";

      // Try to use naddr first, fallback to generating one from aTag
      let identifier = ref.naddr;

      if (!identifier || !identifier.startsWith("naddr")) {
        // Generate naddr from aTag if not available
        try {
          const [kind, pubkey, dTag] = ref.aTag.split(":");
          identifier = nip19.naddrEncode({
            kind: parseInt(kind) as any,
            pubkey: pubkey,
            identifier: dTag || "",
          });
        } catch (error) {
          console.error("Error generating naddr:", error);
          // Fallback to aTag if naddr generation fails
          identifier = ref.aTag;
        }
      }

      return `/${entityType}/${identifier}`;
    },
    [isCalendar]
  );

  // Handle clicking on preview card
  const handlePreviewClick = useCallback(
    (ref: NostrReference) => {
      const url = getEntityUrl(ref);
      window.open(url, "_blank");
    },
    [getEntityUrl]
  );

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
        const sixMonthsFromNow = Math.floor(dayjs().add(6, "months").unix());

        const filters: NDKFilter[] = [
          // Strategy 1: Recent entities by creation time
          {
            kinds: allowedKinds as any[],
            limit: 20,
            until: now,
          },
          // Strategy 2: Search by time range (for events)
          ...(isEvent
            ? [
                {
                  kinds: allowedKinds as any[],
                  limit: 15,
                  since: now,
                  until: sixMonthsFromNow,
                },
              ]
            : []),
          // Strategy 3: Search by different time windows
          {
            kinds: allowedKinds as any[],
            limit: 15,
            until: now + 24 * 3600, // Look in different time windows
          },
        ];

        console.log(
          `Searching entities with query: "${query}" for kinds:`,
          allowedKinds
        );

        const allResults: NDKEvent[] = [];

        // Fetch from multiple strategies in parallel
        const fetchPromises = filters.map(async (filter) => {
          try {
            const eventSet = await ndk.fetchEvents(filter);
            return Array.from(eventSet.values());
          } catch (error) {
            console.error(
              "Error fetching entities with filter:",
              filter,
              error
            );
            return [];
          }
        });

        const results = await Promise.all(fetchPromises);
        results.forEach((entities) => allResults.push(...entities));

        console.log(`Total fetched entities:`, allResults.length);

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

        console.log(`Filtered entities matching "${query}":`, filtered.length);
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
        } catch (error) {
          console.error("Error generating naddr:", error);
          naddr = aTag;
        }
      } else if (inputText) {
        // From manual input (naddr or URL)
        const parsed = parseNostrReference(inputText);
        if (parsed && allowedKinds.includes(parsed.kind)) {
          aTag = `${parsed.kind}:${parsed.pubkey}:${parsed.identifier || ""}`;

          // Use the original naddr if it was provided
          if (inputText.startsWith("naddr")) {
            naddr = inputText;
          } else {
            // Generate naddr from parsed data
            try {
              naddr = nip19.naddrEncode({
                kind: parsed.kind as any,
                pubkey: parsed.pubkey,
                identifier: parsed.identifier || "",
              });
            } catch (error) {
              console.error("Error generating naddr from parsed data:", error);
              naddr = aTag;
            }
          }

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
            const isLoading = loadingEntities.has(ref.aTag);
            return (
              <Card
                key={ref.aTag}
                variant="outlined"
                sx={{
                  mb: 1,
                  cursor: "pointer",
                  "&:hover": {
                    boxShadow: 2,
                    borderColor: "primary.main",
                  },
                }}
                onClick={() => handlePreviewClick(ref)}
              >
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {metadata?.image ? (
                      <Avatar
                        src={metadata.image}
                        sx={{ width: 40, height: 40 }}
                      />
                    ) : (
                      <Avatar sx={{ width: 40, height: 40 }}>
                        {isLoading ? (
                          <CircularProgress size={20} />
                        ) : isCalendar ? (
                          <CalendarMonthIcon />
                        ) : (
                          <EventIcon />
                        )}
                      </Avatar>
                    )}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" noWrap>
                        {isLoading
                          ? "Loading..."
                          : metadata?.title || ref.naddr || ref.aTag}
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
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          removeReference(index);
                        }}
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
