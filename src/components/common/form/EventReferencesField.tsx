// src/components/common/form/EventReferencesField.tsx
import React, { useState, useCallback } from "react";
import {
  Box,
  TextField,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNdk } from "nostr-hooks";
import { type NDKEvent } from "@nostr-dev-kit/ndk";
import { fetchEventById } from "@/utils/nostr/nostrUtils";
import EventPreviewCard from "@/components/common/events/EventPreviewCard";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

export interface EventReference {
  aTag: string;
  event: NDKEvent | null;
  naddr: string;
}

interface EventReferencesFieldProps {
  label: string;
  value: EventReference[];
  onChange: (value: EventReference[]) => void;
  placeholder?: string;
  allowedKinds?: number[];
  showRemoveInPreview?: boolean;
  maxHeight?: number;
}

export default function EventReferencesField({
  label,
  value,
  onChange,
  placeholder = "Paste event naddr or event URL",
  allowedKinds = [31922, 31923],
  showRemoveInPreview = true,
  maxHeight = 400,
}: EventReferencesFieldProps) {
  const { t } = useTranslation();
  const { ndk } = useNdk();
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to extract naddr from input (naddr or URL)
  const extractNaddr = (input: string): string | null => {
    const match = input.match(/naddr1[0-9a-z]+/i);
    return match ? match[0] : null;
  };

  const handleAddReference = useCallback(async () => {
    if (!ndk || !currentInput.trim()) return;

    const naddr = extractNaddr(currentInput);
    if (!naddr) {
      setError(t("eventReferences.error.invalidNaddr", "Invalid naddr format"));
      return;
    }

    // Check if already exists
    if (value.some((ref) => ref.naddr === naddr)) {
      setError(
        t("eventReferences.error.duplicate", "This event is already added")
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const event = await fetchEventById(ndk, naddr);

      if (!event) {
        setError(t("eventReferences.error.notFound", "Event not found"));
        return;
      }

      if (!allowedKinds.includes(event.kind)) {
        setError(
          t(
            "eventReferences.error.invalidKind",
            "This event type is not allowed"
          )
        );
        return;
      }

      const dTag = event.tags.find((t: string[]) => t[0] === "d")?.[1];
      if (!dTag) {
        setError(
          t("eventReferences.error.noDTag", "Event missing required identifier")
        );
        return;
      }

      const aTag = `${event.kind}:${event.pubkey}:${dTag}`;
      const newRef: EventReference = {
        aTag,
        event,
        naddr,
      };

      onChange([...value, newRef]);
      setCurrentInput("");
      setError(null);
    } catch (err) {
      console.error("Error adding event reference:", err);
      setError(t("eventReferences.error.fetchFailed", "Failed to fetch event"));
    } finally {
      setIsLoading(false);
    }
  }, [ndk, currentInput, value, onChange, allowedKinds, t]);

  const handleRemoveReference = useCallback(
    (indexToRemove: number) => {
      const newValue = value.filter((_, index) => index !== indexToRemove);
      onChange(newValue);
    },
    [value, onChange]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddReference();
      }
    },
    [handleAddReference]
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>

      {/* Input Section */}
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={isLoading}
          size="small"
        />
        <IconButton
          onClick={handleAddReference}
          disabled={isLoading || !currentInput.trim()}
          color="primary"
          sx={{ minWidth: 40 }}
        >
          {isLoading ? <CircularProgress size={20} /> : <AddIcon />}
        </IconButton>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary Chips */}
      {value.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          {value.map((ref, index) => (
            <Chip
              key={index}
              label={
                ref.event?.tags.find((t) => t[0] === "title")?.[1] || ref.naddr
              }
              onDelete={() => handleRemoveReference(index)}
              color="primary"
              variant="outlined"
              size="small"
            />
          ))}
        </Box>
      )}

      {/* Event Previews */}
      {value.length > 0 && (
        <Box sx={{ maxHeight, overflowY: "auto" }}>
          {value.map((ref, index) => (
            <Box key={index} sx={{ mb: 2, position: "relative" }}>
              {ref.event && (
                <>
                  <EventPreviewCard event={ref.event} />
                  {showRemoveInPreview && (
                    <IconButton
                      onClick={() => handleRemoveReference(index)}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        bgcolor: "background.paper",
                        color: "error.main",
                        "&:hover": {
                          bgcolor: "error.light",
                          color: "error.contrastText",
                        },
                        boxShadow: 1,
                        zIndex: 1,
                      }}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
