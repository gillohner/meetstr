"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, CircularProgress } from "@mui/material";
import { useActiveUser } from "nostr-hooks";

interface LoginButtonProps {
  variant?: "text" | "contained" | "outlined";
  color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
  errorColor?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
}

export default function LoginButton({
  variant = "contained",
  color = "primary",
  errorColor = "error",
}: LoginButtonProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const { activeUser } = useActiveUser();

  // Setup nostr-login event listeners
  useEffect(() => {
    const onAuth = (e: any) => {
      setIsLoading(false);
      setIsLoggedIn(true);
      // You can access e.detail.npub or other info if needed here
    };

    const onLogout = () => {
      setIsLoggedIn(false);
      setIsLoading(false);
    };

    const onClose = () => {
      // Modal cancelled or closed without login
      setIsLoading(false);
    };

    document.addEventListener("nlAuth", onAuth);
    document.addEventListener("nlLogout", onLogout);
    document.addEventListener("nlClose", onClose);

    return () => {
      document.removeEventListener("nlAuth", onAuth);
      document.removeEventListener("nlLogout", onLogout);
      document.removeEventListener("nlClose", onClose);
    };
  }, []);

  // Keep in sync with nostr-hooks activeUser,
  // just to be safe and consistent:
  useEffect(() => {
    if (activeUser) {
      setIsLoggedIn(true);
      setIsLoading(false);
    } else {
      setIsLoggedIn(false);
    }
  }, [activeUser]);

  const handleLogin = () => {
    setIsLoading(true);
    // Open the nostr-login modal UI
    document.dispatchEvent(new CustomEvent("nlLaunch", { detail: "welcome" }));
  };

  const handleLogout = () => {
    // Trigger nostr-login logout
    document.dispatchEvent(new Event("nlLogout"));
  };

  return (
    <>
      {isLoggedIn ? (
        <Button variant={variant} color="secondary" onClick={handleLogout}>
          {t("navbar.login.logout")}
          <>{activeUser}</>
        </Button>
      ) : (
        <Button variant={variant} color={color} onClick={handleLogin} disabled={isLoading}>
          {isLoading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              {t("navbar.login.connecting")}
            </>
          ) : (
            t("navbar.login.login")
          )}
        </Button>
      )}
    </>
  );
}
