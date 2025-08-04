"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, CircularProgress } from "@mui/material";
import { useLogin } from "nostr-hooks";
import { useActiveUser } from "@/hooks/useActiveUser";

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

  const activeUser = useActiveUser();
  const { loginFromLocalStorage } = useLogin();

  // Setup nostr-login event listeners
  useEffect(() => {
    const onAuth = (e: any) => {
      console.log('nlAuth event received:', e.detail);
      setIsLoading(false);
      setIsLoggedIn(true);
      // CRITICAL: Force nostr-hooks to re-check window.nostr
      setTimeout(() => {
        loginFromLocalStorage();
      }, 100);
    };

    const onCustomAuth = (e: any) => {
      console.log('nostrLoginAuth event received:', e.detail);
      setIsLoading(false);
      setIsLoggedIn(true);
      // CRITICAL: Force nostr-hooks to re-check window.nostr
      setTimeout(() => {
        loginFromLocalStorage();
      }, 100);
    };

    const onLogout = () => {
      console.log('Logout event received');
      setIsLoggedIn(false);
      setIsLoading(false);
    };

    const onClose = () => {
      console.log('Modal closed/cancelled');
      setIsLoading(false);
    };

    // Listen for standard nostr-login events
    document.addEventListener("nlAuth", onAuth);
    document.addEventListener("nlLogout", onLogout);
    document.addEventListener("nlClose", onClose);
    
    // Listen for custom events from your provider
    document.addEventListener("nostrLoginAuth", onCustomAuth);
    document.addEventListener("nostrLoginLogout", onLogout);

    return () => {
      document.removeEventListener("nlAuth", onAuth);
      document.removeEventListener("nlLogout", onLogout);
      document.removeEventListener("nlClose", onClose);
      document.removeEventListener("nostrLoginAuth", onCustomAuth);
      document.removeEventListener("nostrLoginLogout", onLogout);
    };
  }, [loginFromLocalStorage]);

  // Keep in sync with nostr-hooks activeUser
  useEffect(() => {
    console.log('ActiveUser changed:', activeUser);
    if (activeUser) {
      setIsLoggedIn(true);
      setIsLoading(false);
    } else {
      setIsLoggedIn(false);
    }
  }, [activeUser]);

  // Check if user is already logged in on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.nostr) {
      console.log('window.nostr detected on mount');
      setIsLoggedIn(true);
      // Force nostr-hooks to detect the existing window.nostr
      setTimeout(() => {
        loginFromLocalStorage();
      }, 100);
    }
  }, [loginFromLocalStorage]);

  const handleLogin = () => {
    console.log('Login button clicked');
    setIsLoading(true);
    // Launch nostr-login dialog
    document.dispatchEvent(new CustomEvent("nlLaunch", { detail: "welcome" }));
  };

  const handleLogout = () => {
    console.log('Logout button clicked');
    // Trigger nostr-login logout
    document.dispatchEvent(new Event("nlLogout"));
  };

  return (
    <>
      {isLoggedIn ? (
        <Button variant={variant} color="secondary" onClick={handleLogout}>
          {t("navbar.login.logout")}
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
