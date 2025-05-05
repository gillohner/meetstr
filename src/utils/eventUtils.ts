// src/utils/eventUtils.ts
import { NDKEvent } from '@nostr-dev-kit/ndk';

export const getEventMetadata = (event: NDKEvent) => {
  const getTagValue = (tagName: string) => 
    event.tags.find((t) => t[0] === tagName)?.[1];
  
  return {
    name: getTagValue('name'),
    description: getTagValue('description'),
    image: getTagValue('image'),
    location: getTagValue('location'),
    start: getTagValue('start')
  };
};

export const formatDate = (timestamp: string, fallbackText: string) => {
  try {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleString();
} catch (e) {
    return fallbackText;
  }
};
