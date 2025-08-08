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
  if (!window.nostr) {
    throw new Error("No signer available");
  }

  // Create event template from original
  const unsignedEvent = {
    kind: original.kind,
    content: original.content,
    tags: [...original.tags], // Deep copy tags
    created_at: Math.floor(Date.now() / 1000),
    pubkey: await window.nostr.getPublicKey(),
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

  // Sign with window.nostr
  const signedEvent = await window.nostr.signEvent(unsignedEvent);

  // Convert to NDKEvent for publishing
  const ndkEvent = new NDKEventClass(ndk, signedEvent);
  await ndkEvent.publish();
  return ndkEvent;
}

/** Publish a NIP-09 deletion request for one event */
export async function deleteEvent(ndk: NDK, toDelete: NDKEvent, reason = "") {
  if (!window.nostr) {
    throw new Error("No signer available");
  }

  const pubkey = await window.nostr.getPublicKey();

  const unsignedEvent = {
    kind: 5, // NIP-09 deletion
    content: reason,
    tags: [] as string[][],
    created_at: Math.floor(Date.now() / 1000),
    pubkey,
  };

  // Reference by 'a' tag for parameterized replaceable events
  if (["31922", "31923", "31924"].includes(String(toDelete.kind))) {
    const d = toDelete.tags.find((t) => t[0] === "d")?.[1] || "";
    unsignedEvent.tags = [["a", `${toDelete.kind}:${toDelete.pubkey}:${d}`]];
  } else {
    unsignedEvent.tags = [["e", toDelete.id]];
  }

  // Sign with window.nostr
  const signedEvent = await window.nostr.signEvent(unsignedEvent);

  // Convert to NDKEvent for publishing
  const ndkEvent = new NDKEventClass(ndk, signedEvent);
  await ndkEvent.publish();
  return ndkEvent;
}
