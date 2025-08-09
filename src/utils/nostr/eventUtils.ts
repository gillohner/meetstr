// src/utils/nostr/eventUtils.ts
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type NDK from "@nostr-dev-kit/ndk";
import { NDKEvent as NDKEventClass } from "@nostr-dev-kit/ndk";
import { authService } from "@/services/authService";

// Cache for processed metadata to avoid recomputing
const metadataCache = new Map<string, any>();

export const getEventMetadata = (event: NDKEvent) => {
  // Use event ID as cache key
  const cacheKey = event.id;
  if (metadataCache.has(cacheKey)) {
    return metadataCache.get(cacheKey);
  }

  // Pre-process tags into a map for faster lookups
  const tagMap = new Map<string, string[]>();
  event.tags.forEach((tag) => {
    const [key, ...values] = tag;
    if (!tagMap.has(key)) {
      tagMap.set(key, []);
    }
    tagMap.get(key)!.push(...values);
  });

  const getTagValue = (tagName: string) => tagMap.get(tagName)?.[0];
  const getTagValues = (tagName: string) => tagMap.get(tagName) || [];

  const metadata = {
    title: getTagValue("title") || getTagValue("name"),
    start: getTagValue("start"),
    end: getTagValue("end"),
    start_tzid: getTagValue("start_tzid"),
    end_tzid: getTagValue("end_tzid"),
    summary: getTagValue("summary") || getTagValue("description"),
    image: getTagValue("image"),
    location: getTagValue("location"),
    geohash: getTagValue("g"),
    participants: getTagValues("p"),
    labels: [...getTagValues("l"), ...getTagValues("L")],
    hashtags: getTagValues("t"),
    references: getTagValues("r"),
    uuid: getTagValue("d"),
  };

  // Cache the result
  metadataCache.set(cacheKey, metadata);

  // Limit cache size to prevent memory leaks
  if (metadataCache.size > 1000) {
    const firstKey = metadataCache.keys().next().value;
    if (firstKey) {
      metadataCache.delete(firstKey);
    }
  }

  return metadata;
};

/** Publish an updated version of an existing parameterized replaceable event */
export async function republishEvent(
  ndk: NDK,
  original: NDKEvent,
  mutate: (e: NDKEvent) => void
) {
  // Get user info from authService
  const userInfo = authService.getUserInfo();
  if (!userInfo) {
    throw new Error("Authentication required");
  }

  // Create event template from original
  const unsignedEvent = {
    kind: original.kind,
    content: original.content,
    tags: [...original.tags], // Deep copy tags
    created_at: Math.floor(Date.now() / 1000),
    pubkey: userInfo.pubkey,
  };

  // Let caller modify the event template
  const tempEvent = new NDKEventClass(ndk);
  tempEvent.kind = unsignedEvent.kind;
  tempEvent.content = unsignedEvent.content;
  tempEvent.tags = unsignedEvent.tags;
  mutate(tempEvent);

  // Update with mutations
  unsignedEvent.kind = tempEvent.kind;
  unsignedEvent.content = tempEvent.content;
  unsignedEvent.tags = tempEvent.tags;

  // Sign with authService
  const signedEvent = await authService.signEvent(unsignedEvent);

  // Convert to NDKEvent for publishing
  const ndkEvent = new NDKEventClass(ndk, signedEvent);
  await ndkEvent.publish();
  return ndkEvent;
}

/** Publish a NIP-09 deletion request for one event */
export async function deleteEvent(ndk: NDK, toDelete: NDKEvent, reason = "") {
  // Get user info from authService
  const userInfo = authService.getUserInfo();
  if (!userInfo) {
    throw new Error("Authentication required");
  }

  const unsignedEvent = {
    kind: 5, // NIP-09 deletion
    content: reason,
    tags: [] as string[][],
    created_at: Math.floor(Date.now() / 1000),
    pubkey: userInfo.pubkey,
  };

  // Reference by 'a' tag for parameterized replaceable events
  if (["31922", "31923", "31924"].includes(String(toDelete.kind))) {
    const d = toDelete.tags.find((t) => t[0] === "d")?.[1] || "";
    unsignedEvent.tags = [["a", `${toDelete.kind}:${toDelete.pubkey}:${d}`]];
  } else {
    unsignedEvent.tags = [["e", toDelete.id]];
  }

  // Sign with authService
  const signedEvent = await authService.signEvent(unsignedEvent);

  // Convert to NDKEvent for publishing
  const ndkEvent = new NDKEventClass(ndk, signedEvent);
  await ndkEvent.publish();
  return ndkEvent;
}
