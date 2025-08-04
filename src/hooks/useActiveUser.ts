// src/hooks/useCurrentUser.ts
import { useState, useEffect } from "react";

export function useActiveUser() {
  const [user, setUser] = useState<{
    pubkey: string;
    npub: string;
  } | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      if (typeof window !== "undefined" && window.nostr) {
        try {
          // Only check for existing auth without triggering modal
          // We'll rely on nostr-login events to know when user is authenticated
          const pubkey = await window.nostr.getPublicKey();
          if (pubkey) {
            // Convert to npub format if needed
            const { nip19 } = await import("nostr-tools");
            const npub = nip19.npubEncode(pubkey);
            setUser({ pubkey, npub });
          }
        } catch (error) {
          // Don't log error as this is expected when user isn't logged in
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    // Only listen for auth events, don't check on initial load
    // This prevents triggering the auth modal automatically

    // Listen for nostr-login auth events
    const handleAuth = () => {
      setTimeout(checkUser, 100); // Small delay to ensure window.nostr is ready
    };

    const handleLogout = () => {
      setUser(null);
    };

    document.addEventListener("nlAuth", handleAuth);
    document.addEventListener("nlLogout", handleLogout);

    return () => {
      document.removeEventListener("nlAuth", handleAuth);
      document.removeEventListener("nlLogout", handleLogout);
    };
  }, []);

  return user;
}
