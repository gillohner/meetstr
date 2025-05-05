// src/hooks/useSingleCalendarEvent.ts
import { useEffect } from 'react';
import { useSubscription } from 'nostr-hooks';

export const useSingleCalendarEvent = ({ calendarId }: { calendarId: string | undefined }) => {
  const subId = `calendar-${calendarId}`;
  const { events, isLoading, createSubscription } = useSubscription(subId);

  useEffect(() => {
    if (!calendarId) return;

    const filters = {
      ids: [calendarId],
      limit: 1,
    }

    // createSubscription(filters);

  }, [calendarId, createSubscription, isLoading, events, subId]);

  return { events, isLoading };
};
