// src/utils/nostr/delegation.ts
import * as secp256k1 from "@noble/secp256k1";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";
import type { NDKEvent } from "@nostr-dev-kit/ndk";

export interface DelegationConditions {
  kinds?: number[];
  createdAtAfter?: number;
  createdAtBefore?: number;
}

export interface Delegation {
  delegator: string; // pubkey of delegator
  delegatee: string; // pubkey of delegatee
  conditions: string; // conditions query string
  token: string; // delegation signature
}

/**
 * Creates a delegation string for NIP-26
 */
export function createDelegationString(
  delegateePubkey: string,
  conditions: string
): string {
  return `nostr:delegation:${delegateePubkey}:${conditions}`;
}

/**
 * Creates conditions query string from delegation conditions
 */
export function createConditionsString(
  conditions: DelegationConditions
): string {
  const parts: string[] = [];

  if (conditions.kinds) {
    conditions.kinds.forEach((kind) => {
      parts.push(`kind=${kind}`);
    });
  }

  if (conditions.createdAtAfter) {
    parts.push(`created_at>${conditions.createdAtAfter}`);
  }

  if (conditions.createdAtBefore) {
    parts.push(`created_at<${conditions.createdAtBefore}`);
  }

  return parts.join("&");
}

/**
 * Signs a delegation token using delegator's private key
 */
export async function signDelegation(
  delegateePubkey: string,
  conditions: string,
  delegatorPrivkey: string
): Promise<string> {
  const delegationString = createDelegationString(delegateePubkey, conditions);
  const hash = sha256(new TextEncoder().encode(delegationString));
  const signature = await secp256k1.sign(hash, delegatorPrivkey);
  return bytesToHex(signature.toCompactRawBytes());
}

/**
 * Verifies a delegation token
 */
export async function verifyDelegation(
  delegation: Delegation
): Promise<boolean> {
  try {
    const delegationString = createDelegationString(
      delegation.delegatee,
      delegation.conditions
    );
    const hash = sha256(new TextEncoder().encode(delegationString));

    return await secp256k1.verify(delegation.token, hash, delegation.delegator);
  } catch (error) {
    console.error("Delegation verification failed:", error);
    return false;
  }
}

/**
 * Validates that an event satisfies delegation conditions
 */
export function validateDelegationConditions(
  event: NDKEvent,
  conditions: string
): boolean {
  const conditionPairs = conditions.split("&");

  for (const condition of conditionPairs) {
    const [field, operator, value] = condition.match(/(\w+)([<>=]+)(.+)/) || [];

    if (!field || !operator || value === undefined) continue;

    switch (field) {
      case "kind":
        if (operator === "=" && event.kind !== parseInt(value)) {
          return false;
        }
        break;

      case "created_at":
        const eventTime = event.created_at || 0;
        const conditionTime = parseInt(value);

        if (operator === ">" && eventTime <= conditionTime) {
          return false;
        }
        if (operator === "<" && eventTime >= conditionTime) {
          return false;
        }
        break;
    }
  }

  return true;
}

/**
 * Extracts delegation info from an event's tags
 */
export function extractDelegation(event: NDKEvent): Delegation | null {
  const delegationTag = event.tags.find((tag) => tag[0] === "delegation");

  if (!delegationTag || delegationTag.length < 4) {
    return null;
  }

  return {
    delegator: delegationTag[1],
    delegatee: event.pubkey, // The actual signer
    conditions: delegationTag[2],
    token: delegationTag[3],
  };
}

/**
 * Adds delegation tag to an event
 */
export function addDelegationTag(
  event: NDKEvent,
  delegation: Delegation
): void {
  event.tags.push([
    "delegation",
    delegation.delegator,
    delegation.conditions,
    delegation.token,
  ]);
}
