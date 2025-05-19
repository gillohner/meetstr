// src/hooks/useNostrUrlUpdate.ts

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { getEventNip19Encoding } from "@/utils/nostr/nostrUtils";

export const useNostrUrlUpdate = () => {
  const router = useRouter();
  const pathname = usePathname();

  const updateUrlWithNip19 = useCallback(
    (event: NDKEvent | null) => {
      if (!event) return;

      try {
        const nip19Identifier = getEventNip19Encoding(event);
        if (!nip19Identifier) return;

        // Extract the base path without the ID
        const basePath = pathname.substring(0, pathname.lastIndexOf("/") + 1);
        const newPath = `${basePath}${nip19Identifier}`;

        // Update URL without causing navigation/reload
        window.history.replaceState({}, "", newPath);
      } catch (error) {
        console.error("Failed to update URL with NIP-19 identifier:", error);
      }
    },
    [pathname]
  );

  return { updateUrlWithNip19 };
};
