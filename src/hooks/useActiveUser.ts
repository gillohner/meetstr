// src/hooks/useActiveUser.ts
import { useState, useEffect } from "react";
import { authService } from "@/services/authService";

export function useActiveUser() {
  const [user, setUser] = useState<{
    pubkey: string;
    npub: string;
  } | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const isAuthenticated = await authService.isAuthenticated();
      if (isAuthenticated) {
        const userInfo = authService.getUserInfo();
        setUser(userInfo);
      } else {
        setUser(null);
      }
    };

    // Check immediately
    checkUser();

    // Listen for nostr-login auth events
    const handleAuth = async () => {
      await authService.refreshAuthState();
      const userInfo = authService.getUserInfo();
      setUser(userInfo);
    };

    const handleLogout = () => {
      authService.logout();
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
