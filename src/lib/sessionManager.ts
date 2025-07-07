// src/lib/sessionManager.ts
import { NDKSigner } from "@nostr-dev-kit/ndk";

interface NostrSession {
  token: string;
  pubkey: string;
  signerType: "extension" | "remote" | "qr";
  timestamp: number;
  metadata?: {
    nip46Address?: string;
    relays?: string[];
  };
}

class SessionManager {
  private static readonly STORAGE_KEY = "nostr_session";
  private static readonly TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  /**
   * Save a session after successful login
   */
  static async saveSession(
    signer: NDKSigner,
    signerType: "extension" | "remote" | "qr",
    metadata?: any
  ): Promise<void> {
    try {
      if (!signer.user?.pubkey) {
        throw new Error("Signer does not have a valid pubkey");
      }

      // Generate a random session token
      const tokenBytes = new Uint8Array(32);
      crypto.getRandomValues(tokenBytes);
      const token = Array.from(tokenBytes, (b) =>
        b.toString(16).padStart(2, "0")
      ).join("");

      const session: NostrSession = {
        token,
        pubkey: signer.user.pubkey,
        signerType,
        timestamp: Date.now(),
        metadata,
      };

      // Store in localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));

      console.log("Session saved successfully");
    } catch (error) {
      console.error("Failed to save session:", error);
      throw error;
    }
  }

  /**
   * Retrieve saved session if valid
   */
  static getSession(): NostrSession | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const session: NostrSession = JSON.parse(stored);

      // Check if session is expired
      if (Date.now() - session.timestamp > this.TOKEN_EXPIRY) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error("Failed to retrieve session:", error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Clear the stored session
   */
  static clearSession(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log("Session cleared");
    } catch (error) {
      console.error("Failed to clear session:", error);
    }
  }

  /**
   * Check if user is logged in
   */
  static isLoggedIn(): boolean {
    return this.getSession() !== null;
  }

  /**
   * Refresh session timestamp
   */
  static refreshSession(): void {
    const session = this.getSession();
    if (session) {
      session.timestamp = Date.now();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    }
  }

  /**
   * Get pubkey from session
   */
  static getSessionPubkey(): string | null {
    const session = this.getSession();
    return session?.pubkey || null;
  }

  /**
   * Get signer type from session
   */
  static getSessionSignerType(): "extension" | "remote" | "qr" | null {
    const session = this.getSession();
    return session?.signerType || null;
  }
}

export default SessionManager;
