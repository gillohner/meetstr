// src/hooks/useNostrEvent.ts
import { useState, useCallback } from 'react';
import { useNdk } from 'nostr-hooks';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { fetchEventById } from '@/utils/nostrUtils';

export type NostrEventError = 'not_found' | 'invalid_kind' | 'network_error' | null;

export const useNostrEvent = () => {
  const { ndk } = useNdk();
  const [event, setEvent] = useState<NDKEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorCode, setErrorCode] = useState<NostrEventError>(null);

  const fetchEvent = useCallback(async (
    identifier?: string,
    expectedKinds: number[] = []
  ) => {
    if (!ndk || !identifier) {
      setErrorCode(null);
      setEvent(null);
      return;
    }

    setLoading(true);
    try {
      const fetchedEvent = await fetchEventById(ndk, identifier);
      
      if (!fetchedEvent) {
        setErrorCode('not_found');
        setEvent(null);
        return;
      }

      if (expectedKinds.length > 0 && !expectedKinds.includes(fetchedEvent.kind)) {
        setErrorCode('invalid_kind');
        setEvent(null);
        return;
      }

      setEvent(fetchedEvent);
      setErrorCode(null);
    } catch (error) {
      console.error('Event fetch error:', error);
      setErrorCode('network_error');
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [ndk]);

  return { event, loading, errorCode, fetchEvent };
};
