// src/lib/ndkClient.ts
import NDK from "@nostr-dev-kit/ndk";

let ndkInstance: NDK | null = null;

export function getNdk(): NDK {
  if (!ndkInstance) {
    ndkInstance = new NDK({
      explicitRelayUrls: [
        "wss://relay.damus.io",
      ],
    });
    ndkInstance.connect().catch(console.error);
  }
  return ndkInstance;
}
