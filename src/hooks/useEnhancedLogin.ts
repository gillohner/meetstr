// src/hooks/useEnhancedLogin.ts
import { useCallback, useEffect, useState } from "react";
import { useLogin, useNdk } from "nostr-hooks";
import SessionManager from "@/lib/sessionManager";

export interface LoginState {
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  signerType: "extension" | "remote" | "qr" | null;
}

export const useEnhancedLogin = () => {
  const [state, setState] = useState<LoginState>({
    isLoggedIn: false,
    isLoading: false,
    error: null,
    signerType: null,
  });

  const {
    loginWithExtension,
    loginWithRemoteSigner,
    logout: originalLogout,
  } = useLogin();
  const { ndk } = useNdk();

  // Initialize session on mount
  useEffect(() => {
    const session = SessionManager.getSession();
    if (session) {
      setState((prev) => ({
        ...prev,
        isLoggedIn: true,
        signerType: session.signerType,
      }));
    }
  }, []);

  const enhancedLoginWithExtension = useCallback(
    async (options?: {
      onSuccess?: (signer: any) => void;
      onError?: (error: any) => void;
    }) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        await loginWithExtension({
          onSuccess: async (signer) => {
            try {
              // Save session
              await SessionManager.saveSession(signer, "extension");

              setState((prev) => ({
                ...prev,
                isLoggedIn: true,
                isLoading: false,
                signerType: "extension",
              }));

              options?.onSuccess?.(signer);
            } catch (error) {
              console.error("Failed to save session:", error);
              setState((prev) => ({
                ...prev,
                isLoading: false,
                error: "Failed to save session",
              }));
              options?.onError?.(error);
            }
          },
          onError: (error) => {
            setState((prev) => ({
              ...prev,
              isLoading: false,
              error: error.message || "Extension login failed",
            }));
            options?.onError?.(error);
          },
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
        options?.onError?.(error);
      }
    },
    [loginWithExtension]
  );

  const enhancedLoginWithRemoteSigner = useCallback(
    async (options?: {
      nip46Address?: string;
      onSuccess?: (signer: any) => void;
      onError?: (error: any) => void;
    }) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        await loginWithRemoteSigner({
          nip46Address: options?.nip46Address,
          onSuccess: async (signer) => {
            try {
              // Save session with metadata
              await SessionManager.saveSession(signer, "remote", {
                nip46Address: options?.nip46Address,
              });

              setState((prev) => ({
                ...prev,
                isLoggedIn: true,
                isLoading: false,
                signerType: "remote",
              }));

              options?.onSuccess?.(signer);
            } catch (error) {
              console.error("Failed to save session:", error);
              setState((prev) => ({
                ...prev,
                isLoading: false,
                error: "Failed to save session",
              }));
              options?.onError?.(error);
            }
          },
          onError: (error) => {
            setState((prev) => ({
              ...prev,
              isLoading: false,
              error: error.message || "Remote signer connection failed",
            }));
            options?.onError?.(error);
          },
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
        options?.onError?.(error);
      }
    },
    [loginWithRemoteSigner]
  );

  const enhancedLogout = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      // Clear session
      SessionManager.clearSession();

      // Call original logout
      await originalLogout();

      setState((prev) => ({
        ...prev,
        isLoggedIn: false,
        isLoading: false,
        signerType: null,
        error: null,
      }));
    } catch (error) {
      console.error("Logout failed:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Logout failed",
      }));
    }
  }, [originalLogout]);

  const refreshSession = useCallback(() => {
    SessionManager.refreshSession();
  }, []);

  return {
    ...state,
    loginWithExtension: enhancedLoginWithExtension,
    loginWithRemoteSigner: enhancedLoginWithRemoteSigner,
    logout: enhancedLogout,
    refreshSession,
  };
};
