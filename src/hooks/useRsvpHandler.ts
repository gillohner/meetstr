// src/hooks/useRsvpHandler.ts
import { useState } from 'react';
import { useNDK } from 'nostr-hooks';
import { createRsvpEvent } from '@/utils/rsvpUtils';

export const useRsvpHandler = (event: NDKEvent) => {
  const { ndk } = useNDK();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submitRsvp = async (status: string) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const rsvpEvent = createRsvpEvent(event, status);
      await rsvpEvent.publish();
      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitRsvp, isSubmitting, error };
};
