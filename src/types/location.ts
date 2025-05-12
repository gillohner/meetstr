// src/types/location.ts
export interface LocationData {
  coords: { latitude: number; longitude: number };
  osmInfo?: {
    displayName: string;
    id: number;
    type: string;
    tags: Record<string, string>;
  };
  paymentMethods: {
    acceptsBitcoin: boolean;
    onChain: boolean;
    lightning: boolean;
    contactless: boolean;
  };
  mapLinks: Record<string, string>;
  formattedName: string;
  formattedAddress: string;
}
