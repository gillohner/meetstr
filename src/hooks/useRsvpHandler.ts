// src/hooks/useRsvpHandler.ts
import { useState, useEffect, useCallback } from "react";
import { useNdk, useActiveUser } from "nostr-hooks";
import { NDKEvent, type NDKFilter } from "@nostr-dev-kit/ndk";
import { v4 as uuidv4 } from "uuid";
import { useSnackbar } from "@/context/SnackbarContext";
import { useTranslation } from "react-i18next";

export type RsvpStatus = "accepted" | "tentative" | "declined" | null;

interface EventWithTags extends NDKEvent {
  tags: string[][];
}

export function useRsvpHandler(event: EventWithTags) {
  const { ndk } = useNdk();
  const { activeUser } = useActiveUser();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const [currentRsvp, setCurrentRsvp] = useState<NDKEvent | null>(null);
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Get event coordinates for addressing
  const getEventCoordinates = useCallback(() => {
    if (!event) return null;
    const dTag = event.tags?.find((t: string[]) => t[0] === "d");
    const dValue = dTag ? dTag[1] : "";
    return `${event.kind}:${event.pubkey}:${dValue}`;
  }, [event]);

  // Fetch current user's RSVP
  useEffect(() => {
    if (!ndk || !event?.id || !activeUser) return;

    setLoading(true);

    const filters: NDKFilter[] = [
      {
        // @ts-ignore
        kinds: [31925],
        "#e": [event.id],
        authors: [activeUser.pubkey],
      },
    ];

    const eventCoordinates = getEventCoordinates();
    if (eventCoordinates) {
      filters.push({
        // @ts-ignore
        kinds: [31925],
        "#a": [eventCoordinates],
        authors: [activeUser.pubkey],
      });
    }

    const sub = ndk.subscribe(filters, { closeOnEose: true });

    sub.on("event", (rsvpEvent) => {
      setCurrentRsvp(rsvpEvent);
      const statusTag = rsvpEvent.tags?.find(
        (t: string[]) => t[0] === "status"
      );
      if (statusTag && statusTag[1]) {
        setRsvpStatus(statusTag[1] as RsvpStatus);
      }
    });

    sub.on("eose", () => {
      setLoading(false);
    });

    return () => {
      sub.stop();
    };
  }, [ndk, event?.id, activeUser, getEventCoordinates]);

  // Create new RSVP
  const createRsvp = useCallback(
    async (status: RsvpStatus) => {
      if (!ndk || !event?.id || !activeUser) return;

      try {
        setLoading(true);

        // If there's an existing RSVP, delete it first
        if (currentRsvp) {
          await deleteRsvp();
        }

        const rsvpEvent = new NDKEvent(ndk);
        rsvpEvent.content = status || "";
        rsvpEvent.kind = 31925;

        const eTag = event.id;
        const aTag = getEventCoordinates() || "";

        rsvpEvent.tags = [
          ["e", eTag],
          ["a", aTag],
          ["d", uuidv4()],
          ["status", status || ""],
          ["p", event.pubkey],
        ];

        await rsvpEvent.publish();
        setCurrentRsvp(rsvpEvent);
        setRsvpStatus(status);
        showSnackbar(t("event.rsvp.success"), "success");
      } catch (error) {
        console.error("Error creating RSVP:", error);
        showSnackbar(t("event.rsvp.error"), "error");
      } finally {
        setLoading(false);
      }
    },
    [ndk, event, activeUser, currentRsvp, getEventCoordinates, showSnackbar, t]
  );

  // Delete RSVP using NIP-09
  const deleteRsvp = useCallback(async () => {
    if (!ndk || !currentRsvp || !activeUser) return;

    try {
      setLoading(true);

      // Create NIP-09 deletion event
      const deletionEvent = new NDKEvent(ndk);
      deletionEvent.kind = 5; // Event deletion request
      deletionEvent.content = "RSVP withdrawn";
      deletionEvent.tags = [["e", currentRsvp.id]];

      // Add "k" tag for kind as recommended in NIP-09
      deletionEvent.tags.push(["k", "31925"]);

      await deletionEvent.publish();
      setCurrentRsvp(null);
      setRsvpStatus(null);
      showSnackbar(t("event.rsvp.deleted"), "info");
    } catch (error) {
      console.error("Error deleting RSVP:", error);
      showSnackbar(t("event.rsvp.deleteError"), "error");
    } finally {
      setLoading(false);
    }
  }, [ndk, currentRsvp, activeUser, showSnackbar, t]);

  // Update RSVP (delete + create)
  const updateRsvp = useCallback(
    (status: RsvpStatus) => {
      createRsvp(status);
    },
    [createRsvp]
  );

  return {
    rsvpStatus,
    currentRsvp,
    loading,
    createRsvp,
    deleteRsvp,
    updateRsvp,
  };
}
