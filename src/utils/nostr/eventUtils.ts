// src/utils/eventUtils.ts
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { get } from 'http';

export const getEventMetadata = (event: NDKEvent) => {
  const getTagValue = (tagName: string) =>
    event.tags.find((t) => t[0] === tagName)?.[1];

  // Fetch all values for repeatable tags
  const getTagValues = (tagName: string) =>
    event.tags.filter((t) => t[0] === tagName).map((t) => t.slice(1));

  console.log('title: ', getTagValue('title'));
  console.log('name: ', getTagValue('name'));
  console.log('summary: ', getTagValue('summary'));
  console.log('description: ', getTagValue('description'));

  return {
    title: getTagValue('title') ? getTagValue('title') : getTagValue('name'),
    start: getTagValue('start'),
    end: getTagValue('end'),
    start_tzid: getTagValue('start_tzid'),
    end_tzid: getTagValue('end_tzid'),
    summary: getTagValue('summary') ? getTagValue('summary') : getTagValue('description'),
    image: getTagValue('image'),
    // Repeatable tags:
    location: getTagValue('location'),
    geohash: getTagValue('g'),
    participants: getTagValues('p'), // [["pubkey", "relay", "role"], ...]
    labels: [
      ...getTagValues('l').flat(), // ["audiospace", ...]
      ...getTagValues('L').flat(), // ["com.cornychat", ...]
    ],
    hashtags: getTagValues('t').flat(), // ["tag1", "tag2", ...]
    references: getTagValues('r').flat(), // ["url1", "url2", ...]
    // Optionally include deprecated fields, UUID, etc.
    uuid: getTagValue('d'),
  };
};
