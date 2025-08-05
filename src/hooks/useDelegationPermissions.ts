// src/hooks/useDelegationPermissions.ts
import { useState, useEffect } from "react";
import { useActiveUser } from "@/hooks/useActiveUser";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import {
  extractDelegation,
  validateDelegationConditions,
} from "@/utils/nostr/delegation";

export interface UserPermissions {
  canCreateEvents: boolean;
  canEditEvents: boolean;
  canDeleteEvents: boolean;
  isOwner: boolean;
  isCoHost: boolean;
  delegationValid: boolean;
}

/**
 * Hook to check user's permissions for a calendar
 */
export const useDelegationPermissions = (
  calendarEvent: NDKEvent | null
): UserPermissions => {
  const activeUser = useActiveUser();
  const [permissions, setPermissions] = useState<UserPermissions>({
    canCreateEvents: false,
    canEditEvents: false,
    canDeleteEvents: false,
    isOwner: false,
    isCoHost: false,
    delegationValid: false,
  });

  useEffect(() => {
    if (!activeUser || !calendarEvent) {
      setPermissions({
        canCreateEvents: false,
        canEditEvents: false,
        canDeleteEvents: false,
        isOwner: false,
        isCoHost: false,
        delegationValid: false,
      });
      return;
    }

    const isOwner = activeUser.pubkey === calendarEvent.pubkey;

    // Find co-host tag for current user
    const coHostTag = calendarEvent.tags.find(
      (tag) =>
        tag[0] === "p" && tag[1] === activeUser.pubkey && tag[3] === "co-host"
    );

    const isCoHost = !!coHostTag;
    let coHostPermissions: string[] = [];

    if (coHostTag && coHostTag[4]) {
      coHostPermissions = coHostTag[4].split(",");
    }

    // Check delegation validity if co-host
    let delegationValid = false;
    if (isCoHost) {
      const delegationTag = calendarEvent.tags.find(
        (tag) => tag[0] === "delegation" && tag[1] === activeUser.pubkey
      );

      if (delegationTag) {
        // Create a dummy event to validate conditions
        const dummyEvent = new NDKEvent();
        dummyEvent.kind = 31923; // Event kind
        dummyEvent.created_at = Math.floor(Date.now() / 1000);
        dummyEvent.pubkey = activeUser.pubkey;

        delegationValid = validateDelegationConditions(
          dummyEvent,
          delegationTag[2]
        );
      }
    }

    setPermissions({
      canCreateEvents:
        isOwner || (isCoHost && coHostPermissions.includes("create")),
      canEditEvents:
        isOwner || (isCoHost && coHostPermissions.includes("edit")),
      canDeleteEvents:
        isOwner || (isCoHost && coHostPermissions.includes("delete")),
      isOwner,
      isCoHost,
      delegationValid: isOwner || delegationValid,
    });
  }, [activeUser, calendarEvent]);

  return permissions;
};
