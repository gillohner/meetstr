import type { NDKEvent } from "@nostr-dev-kit/ndk";

export function extractHashtags(event: NDKEvent): string[] {
  return event.tags
    .filter((tag) => tag[0] === "t" && tag[1])
    .map((tag) => tag[1])
    .filter(Boolean);
}

export function generateKeywords(
  hashtags: string[],
  baseKeywords: string[] = []
): string[] {
  const defaultKeywords = [
    "nostr",
    "calendar",
    "event",
    "decentralized",
    "meetup",
  ];
  return [...new Set([...defaultKeywords, ...baseKeywords, ...hashtags])];
}

export function formatHashtagsForMeta(hashtags: string[]): string {
  return hashtags.map((tag) => `#${tag}`).join(", ");
}
