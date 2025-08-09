// src/hooks/useRsvpHandler.ts
import { useState, useEffect, useCallback } from "react";
import { useNdk } from "nostr-hooks";
import { useActiveUser } from "@/hooks/useActiveUser";
import { type NDKFilter } from "@nostr-dev-kit/ndk";
import { v4 as uuidv4 } from "uuid";
import { useSnackbar } from "@/context/SnackbarContext";
import { useTranslation } from "react-i18next";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { authService } from "@/services/authService";

export type RsvpStatus = "accepted" | "tentative" | "declined" | null;

interface EventWithTags {
  id: string;
  kind: number;
  pubkey: string;
  tags: string[][];
}

export function useRsvpHandler(event: EventWithTags) {
  const { ndk } = useNdk();
  const activeUser = useActiveUser();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const [currentRsvp, setCurrentRsvp] = useState<any | null>(null);
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

        const eTag = event.id;
        const aTag = getEventCoordinates() || "";

        // Create event using authService
        const unsignedEvent = {
          kind: 31925,
          content: status || "",
          tags: [
            ["e", eTag],
            ["a", aTag],
            ["d", uuidv4()],
            ["status", status || ""],
            ["p", event.pubkey],
          ],
          created_at: Math.floor(Date.now() / 1000),
          pubkey: activeUser.pubkey,
        };

        // Sign with authService (will handle authentication)
        const signedEvent = await authService.signEvent(unsignedEvent);

        // Convert to NDKEvent for publishing
        const ndkEvent = new NDKEvent(ndk, signedEvent);
        await ndkEvent.publish();

        setCurrentRsvp(signedEvent);
        setRsvpStatus(status);
        showSnackbar(t("event.rsvp.success"), "success");
      } catch (error) {
        console.error("Error creating RSVP:", error);
        if (
          error instanceof Error &&
          error.message.includes("Authentication required")
        ) {
          showSnackbar(t("auth.required", "Please log in to RSVP"), "warning");
        } else {
          showSnackbar(t("event.rsvp.error"), "error");
        }
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

      // Create NIP-09 deletion event using authService
      const unsignedEvent = {
        kind: 5, // Event deletion request
        content: "RSVP withdrawn",
        tags: [
          ["e", currentRsvp.id],
          ["k", "31925"], // Add "k" tag for kind as recommended in NIP-09
        ],
        created_at: Math.floor(Date.now() / 1000),
        pubkey: activeUser.pubkey,
      };

      // Sign with authService
      const signedEvent = await authService.signEvent(unsignedEvent);

      // Convert to NDKEvent for publishing
      const ndkEvent = new NDKEvent(ndk, signedEvent);
      await ndkEvent.publish();

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
