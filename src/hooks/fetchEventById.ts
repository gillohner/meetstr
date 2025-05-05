import { NDK, NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk';

/**
 * Utility function to fetch a Nostr event by its ID
 * @param ndk - The initialized NDK instance
 * @param eventId - The ID of the event to fetch
 * @returns Promise that resolves to the event or null if not found
 */
export const fetchEventById = async (ndk: NDK, eventId: string): Promise<NDKEvent | null> => {
  if (!ndk) {
    throw new Error('NDK instance not provided');
  }
  
  try {
    const filter: NDKFilter = { ids: [eventId] };
    // Use NDK's fetchEvent method which returns the first matching event
    const event = await ndk.fetchEvent(filter);
    return event;
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
};
