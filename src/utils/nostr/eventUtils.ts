// src/utils/nostr/eventUtils.ts
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type NDK from "@nostr-dev-kit/ndk";
import { NDKEvent as NDKEventClass } from "@nostr-dev-kit/ndk";

export const getEventMetadata = (event: NDKEvent) => {
  const getTagValue = (tagName: string) =>
    event.tags.find((t) => t[0] === tagName)?.[1];

  // Fetch all values for repeatable tags
  const getTagValues = (tagName: string) =>
    event.tags.filter((t) => t[0] === tagName).map((t) => t.slice(1));

  return {
    title: getTagValue("title") ? getTagValue("title") : getTagValue("name"),
    start: getTagValue("start"),
    end: getTagValue("end"),
    start_tzid: getTagValue("start_tzid"),
    end_tzid: getTagValue("end_tzid"),
    summary: getTagValue("summary")
      ? getTagValue("summary")
      : getTagValue("description"),
    image: getTagValue("image"),
    // Repeatable tags:
    location: getTagValue("location"),
    geohash: getTagValue("g"),
    participants: getTagValues("p"), // [["pubkey", "relay", "role"], ...]
    labels: [
      ...getTagValues("l").flat(), // ["audiospace", ...]
      ...getTagValues("L").flat(), // ["com.cornychat", ...]
    ],
    hashtags: getTagValues("t").flat(), // ["tag1", "tag2", ...]
    references: getTagValues("r").flat(), // ["url1", "url2", ...]
    // Optionally include deprecated fields, UUID, etc.
    uuid: getTagValue("d"),
  };
};

/** Publish an updated version of an existing parameterized replaceable event */
export async function republishEvent(
  ndk: NDK,
  original: NDKEvent,
  mutate: (e: NDKEvent) => void
) {
  const updated = new NDKEventClass(ndk);

  // Copy all fields from original
  updated.kind = original.kind;
  updated.content = original.content;
  updated.tags = [...original.tags]; // Deep copy tags
  updated.created_at = Math.floor(Date.now() / 1000);

  // Let caller modify the event
  mutate(updated);

  await updated.sign();
  await updated.publish();
  return updated;
}

/** Publish a NIP-09 deletion request for one event */
export async function deleteEvent(ndk: NDK, toDelete: NDKEvent, reason = "") {
  const del = new NDKEventClass(ndk);
  del.kind = 5; // NIP-09 deletion
  del.content = reason;

  // Reference by 'a' tag for parameterized replaceable events
  if (["31922", "31923", "31924"].includes(String(toDelete.kind))) {
    const d = toDelete.tags.find((t) => t[0] === "d")?.[1] || "";
    del.tags = [["a", `${toDelete.kind}:${toDelete.pubkey}:${d}`]];
  } else {
    del.tags = [["e", toDelete.id]];
  }

  await del.sign();
  await del.publish();
  return del;
}
