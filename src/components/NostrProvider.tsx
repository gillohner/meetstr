// src/components/NostrProvider.tsx
'use client';

import { ReactNode, createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

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
  const [isExtensionAvailable, setIsExtensionAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs for tracking async states to prevent stale closures
  const isLoginInProgress = useRef(false);
  const isSigningInProgress = useRef(false);
  const pendingSignRequests = useRef<Array<{
    event: NostrEvent;
    resolve: (value: NostrEvent | null) => void;
    reject: (reason?: any) => void;
  }>>([]);

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

  const login = useCallback(async () => {
    if (isLoginInProgress.current) return;
    isLoginInProgress.current = true;
    setError(null);
    
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
      setError(err instanceof Error ? err.message : 'Login failed');
      setPublicKey(null);
    } finally {
      isLoginInProgress.current = false;
    }
  }, []);

  const signEvent = useCallback(async (event: NostrEvent): Promise<NostrEvent | null> => {
    if (!publicKey) return null;
    
    // If already signing, queue the request
    if (isSigningInProgress.current) {
      return new Promise((resolve, reject) => {
        pendingSignRequests.current.push({ event, resolve, reject });
      });
    }

    isSigningInProgress.current = true;
    
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
    } finally {
      isSigningInProgress.current = false;
      
      // Process next request in queue
      const nextRequest = pendingSignRequests.current.shift();
      if (nextRequest) {
        signEvent(nextRequest.event)
          .then(nextRequest.resolve)
          .catch(nextRequest.reject);
      }
    }
  }, [publicKey]);

  const logout = useCallback(() => {
    localStorage.removeItem('nostr-pubkey');
    setPublicKey(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isLoginInProgress.current = false;
      isSigningInProgress.current = false;
      pendingSignRequests.current = [];
    };
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
