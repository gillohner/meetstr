// src/hooks/useBlossomUpload.ts
import { BlossomClient } from "blossom-client-sdk";
import { useNdk } from "nostr-hooks";
import { useActiveUser } from "nostr-hooks";
import { getEventHash } from "nostr-tools";
import {
  type EventTemplate,
  type UnsignedEvent,
  type Event,
} from "nostr-tools";

export const useBlossomUpload = () => {
  const { ndk } = useNdk();
  const { activeUser } = useActiveUser();

  const uploadFile = async (file: File) => {
    if (!ndk || !activeUser?.pubkey || !ndk.signer) return null;

    try {
      // 1. Create signer function first
      const signer = async (draft: EventTemplate) => {
        const event: UnsignedEvent = {
          ...draft,
          pubkey: activeUser.pubkey,
          created_at: Math.floor(Date.now() / 1000),
        };
        const sig = await ndk.signer!.sign(event);
        return { ...event, sig, id: getEventHash(event) } as Event;
      };

      // 2. Create client instance with signer
      const server = "https://blossom.nostr.build";
      const client = new BlossomClient(server, signer);

      // 3. Create upload auth
      const uploadOptions = {
        message: file.type,
      };

      // 4. Create upload auth with proper options
      const uploadAuth = await client.createUploadAuth(file, uploadOptions);
      console.log("Upload auth:", uploadAuth);

      // 5. Upload the blob
      const res = await client.uploadBlob(file, { auth: uploadAuth });
      console.log("Upload response:", res);

      return res.url;
    } catch (error) {
      console.error("Upload failed:", error);
      return "error";
    }
  };

  return { uploadFile };
};
