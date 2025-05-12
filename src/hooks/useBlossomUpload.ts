// src/hooks/useBlossomUpload.ts
import { BlossomClient } from "blossom-client-sdk";
import { useNdk } from "nostr-hooks";
import { useActiveUser } from "nostr-hooks";
import { getEventHash } from "nostr-tools";

export const useBlossomUpload = () => {
  const { ndk } = useNdk();
  const { activeUser } = useActiveUser();

  const uploadFile = async (file: File) => {
    if (!ndk || !activeUser?.pubkey) return null;

    try {
      // 1. Create signer function first
      const signer = async (draft: EventTemplate) => {
        const event: UnsignedEvent = {
          ...draft,
          pubkey: activeUser.pubkey,
          created_at: Math.floor(Date.now() / 1000),
        };
        const sig = await ndk.signer.sign(event);
        return { ...event, sig, id: getEventHash(event) };
      };

      // 2. Create client instance with signer
      const server = "https://blossom.nostr.build";
      const client = new BlossomClient(server, signer);

      // 3. Use instance method instead of static method
      const uploadAuth = await client.createUploadAuth(file, {
        message: file.type,
      });

      console.log("Upload auth:", uploadAuth);

      // 4. Use instance method for upload
      const res = await client.uploadBlob(file, uploadAuth);
      console.log("Upload response:", res);

      return res.url;
    } catch (error) {
      console.error("Upload failed:", error);
      return "error";
    }
  };

  return { uploadFile };
};
