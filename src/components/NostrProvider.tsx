// src/components/NostrProvider.tsx
'use client';

import { ReactNode, createContext, useContext, useState, useEffect, useCallback } from 'react';

// Define types based on NIP-07 spec
type NostrEvent = {
  created_at: number;
  kind: number;
  tags: string[][];
  content: string;
  id?: string;
  pubkey?: string;
  sig?: string;
};

interface NostrWindow extends Window {
  nostr?: {
    getPublicKey(): Promise<string>;
    signEvent(event: NostrEvent): Promise<NostrEvent>;
    nip04?: {
      encrypt(pubkey: string, plaintext: string): Promise<string>;
      decrypt(pubkey: string, ciphertext: string): Promise<string>;
    };
  };
}

interface NostrContextType {
  publicKey: string | null;
  isExtensionAvailable: boolean;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  signEvent: (event: NostrEvent) => Promise<NostrEvent | null>;
  error: string | null;
}

const NostrContext = createContext<NostrContextType | undefined>(undefined);

export default function NostrProvider({ children }: { children: ReactNode }) {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isExtensionAvailable, setIsExtensionAvailable] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false); // Add login state flag

  // Check for extension and restore session
  useEffect(() => {
    const checkExtension = async () => {
      const nostrWindow = window as NostrWindow;
      const available = !!nostrWindow.nostr;
      setIsExtensionAvailable(available);

      if (available) {
        const savedPubkey = localStorage.getItem('nostr-pubkey');
        if (savedPubkey) {
          setPublicKey(savedPubkey);
        }
      }
      
      setIsLoading(false);
    };
    
    checkExtension();
  }, []);

  // Login with NIP-07 extension (updated with anti-duplication)
  const login = useCallback(async () => {
    if (isLoggingIn) return; // Prevent duplicate logins
    
    setError(null);
    setIsLoggingIn(true);
    
    try {
      const nostrWindow = window as NostrWindow;
      
      if (!nostrWindow.nostr) {
        throw new Error('Nostr extension not found');
      }
      
      const pubkey = await nostrWindow.nostr.getPublicKey();
      setPublicKey(pubkey);
      localStorage.setItem('nostr-pubkey', pubkey);
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to login with Nostr extension');
      setPublicKey(null);
    } finally {
      setIsLoggingIn(false);
    }
  }, [isLoggingIn]); // Add dependency

  // Sign an event using the NIP-07 extension
  const signEvent = useCallback(async (event: NostrEvent): Promise<NostrEvent | null> => {
    if (!publicKey) return null;
    
    try {
      const nostrWindow = window as NostrWindow;
      
      if (!nostrWindow.nostr) {
        throw new Error('Nostr extension not found');
      }
      
      return await nostrWindow.nostr.signEvent(event);
    } catch (err) {
      console.error('Failed to sign event:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign event');
      return null;
    }
  }, [publicKey]);

  // Logout and clear storage
  const logout = useCallback(() => {
    localStorage.removeItem('nostr-pubkey');
    setPublicKey(null);
  }, []);

  return (
    <NostrContext.Provider
      value={{
        publicKey,
        isExtensionAvailable,
        isLoggedIn: !!publicKey,
        isLoading,
        login,
        logout,
        signEvent,
        error
      }}
    >
      {children}
    </NostrContext.Provider>
  );
}

export function useNostr() {
  const context = useContext(NostrContext);
  if (context === undefined) {
    throw new Error('useNostr must be used within a NostrProvider');
  }
  return context;
}
