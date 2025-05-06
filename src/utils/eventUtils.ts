// src/utils/eventUtils.ts
import { NDKEvent } from '@nostr-dev-kit/ndk';

export const getEventMetadata = (event: NDKEvent) => {
  const getTagValue = (tagName: string) => 
    event.tags.find((t) => t[0] === tagName)?.[1];

  console.log('Event Tags:', event.tags);
  
  return {
    title: getTagValue('title') ? getTagValue('title') : getTagValue('name'),
    start: getTagValue('start'),
    end: getTagValue('end'),
    start_tzid: getTagValue('start_tzid'),
    end_tzid: getTagValue('end_tzid'),
    summary: getTagValue('summary') ? getTagValue('summary') : getTagValue('description'),
    image: getTagValue('image'),
    location: getTagValue('location'),
    geohash: getTagValue('g'),
  };
};

export const formatDate = (timestamp: string, fallbackText: string) => {
  try {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return fallbackText;
  }
};
