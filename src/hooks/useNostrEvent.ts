// src/hooks/useNostrEvent.ts
import { useState, useCallback } from "react";
import { useNdk } from "nostr-hooks";
import { type NDKEvent } from "@nostr-dev-kit/ndk";
import { fetchEventById } from "@/utils/nostr/nostrUtils";
import { republishEvent, deleteEvent } from "@/utils/nostr/eventUtils";

export type NostrEventError =
  | "not_found"
  | "invalid_kind"
  | "network_error"
  | null;

export const useNostrEvent = () => {
  const { ndk } = useNdk();
  const [event, setEvent] = useState<NDKEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorCode, setErrorCode] = useState<NostrEventError>(null);

  const fetchEvent = useCallback(
    async (identifier?: string, expectedKinds: number[] = []) => {
      if (!ndk || !identifier) {
        setErrorCode(null);
        setEvent(null);
        return;
      }

      setLoading(true);

      // Use AbortController for cleanup
      const controller = new AbortController();

      try {
        const fetchedEvent = await fetchEventById(ndk, identifier);

        if (!fetchedEvent) {
          console.error("Event not found");
          setErrorCode("not_found");
          setEvent(null);
          return;
        }

        console.log("Fetched event:", fetchedEvent);
        console.log("Fetched event kind:", fetchedEvent.kind);
        if (
          expectedKinds.length > 0 &&
          !expectedKinds.includes(fetchedEvent.kind)
        ) {
          setErrorCode("invalid_kind");
          setEvent(null);
          return;
        }

        setEvent(fetchedEvent);
        setErrorCode(null);
      } catch (error) {
        // More specific error handling
        if (error instanceof TypeError) {
          console.error("Network error:", error);
          setErrorCode("network_error");
        } else {
          console.error("Event fetch error:", error);
          setErrorCode("network_error");
        }
        setEvent(null);
      } finally {
        setLoading(false);
      }

      // Return cleanup function
      return () => controller.abort();
    },
    [ndk]
  );

  const updateEvent = useCallback(
    async (originalEvent: NDKEvent, mutate: (e: NDKEvent) => void) => {
      if (!ndk) throw new Error("NDK not available");

      const updated = await republishEvent(ndk, originalEvent, mutate);
      setEvent(updated);
      return updated;
    },
    [ndk]
  );

  const removeEvent = useCallback(
    async (eventToDelete: NDKEvent, reason?: string) => {
      if (!ndk) throw new Error("NDK not available");

      await deleteEvent(ndk, eventToDelete, reason);
      setEvent(null);
    },
    [ndk]
  );

  return {
    event,
    loading,
    errorCode,
    fetchEvent,
    updateEvent,
    removeEvent,
  };
};
