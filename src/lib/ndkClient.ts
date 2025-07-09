// src/lib/ndkClient.ts
import NDK from "@nostr-dev-kit/ndk";

let ndkInstance: NDK | null = null;

export function getNdk(): NDK {
  if (!ndkInstance) {
    ndkInstance = new NDK({
      explicitRelayUrls: [
        "wss://multiplexer.huszonegy.world/",
        "wss://relay.damus.io",
        "wss://nos.lol",
        "wss://relay.primal.net",
        "wss://relay.nostr.band",
        "wss://relay.nostr.watch",
        "wss://relay.snort.social",
        "wss://relay.nostr.band",
      ],
    });
    ndkInstance.connect().catch(console.error);
  }
  return ndkInstance;
}
