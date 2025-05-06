// src/utils/nostr/rsvpUtils.ts
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { v4 as uuidv4 } from 'uuid';

export const createRsvpEvent = (
  originalEvent: NDKEvent,
  status: 'accepted' | 'declined' | 'tentative',
  content: string = ''
): NDKEvent => {
  const rsvpEvent = new NDKEvent(originalEvent.ndk);
  rsvpEvent.kind = 31925;
  rsvpEvent.content = content;
  
  // Get original event coordinates (a tag)
  const aTag = `31922:${originalEvent.pubkey}:${originalEvent.tagValue('d')}`;
  
  rsvpEvent.tags = [
    ['a', aTag],
    ['d', uuidv4()],
    ['status', status],
    ['p', originalEvent.pubkey]
  ];

  return rsvpEvent;
};

export const publishRsvp = async (rsvpEvent: NDKEvent) => {
  try {
    await rsvpEvent.publish();
    return true;
  } catch (error) {
    console.error('RSVP publication failed:', error);
    return false;
  }
};
