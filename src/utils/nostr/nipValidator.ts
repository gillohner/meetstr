import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class NIPValidator {
  /**
   * Validates NIP-01 basic event structure
   */
  static validateBasicEvent(event: NDKEvent): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (typeof event.kind !== "number") {
      errors.push("Event kind must be a number");
    }

    if (typeof event.content !== "string") {
      errors.push("Event content must be a string");
    }

    if (!event.pubkey || typeof event.pubkey !== "string") {
      errors.push("Event pubkey is required and must be a string");
    } else if (!/^[0-9a-f]{64}$/.test(event.pubkey)) {
      errors.push("Event pubkey must be a valid 64-character hex string");
    }

    if (typeof event.created_at !== "number") {
      errors.push("Event created_at must be a Unix timestamp number");
    } else if (event.created_at <= 0) {
      errors.push("Event created_at must be a positive timestamp");
    }

    if (!Array.isArray(event.tags)) {
      errors.push("Event tags must be an array");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validates NIP-52 calendar event structure
   */
  static validateCalendarEvent(event: NDKEvent): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // First validate basic structure
    const basicValidation = this.validateBasicEvent(event);
    errors.push(...basicValidation.errors);
    warnings.push(...basicValidation.warnings);

    // Check if it's a valid calendar event kind
    const validKinds = [31922, 31923, 31924];
    if (!validKinds.includes(event.kind!)) {
      errors.push(
        `Invalid calendar event kind: ${event.kind}. Must be 31922, 31923, or 31924`
      );
      return { isValid: false, errors, warnings };
    }

    // Check required tags
    const dTag = event.tags?.find((t) => t[0] === "d");
    if (!dTag) {
      errors.push('Calendar event must have a "d" tag for identifier');
    } else if (!dTag[1] || typeof dTag[1] !== "string") {
      errors.push('Calendar event "d" tag must have a valid identifier');
    }

    const titleTag = event.tags?.find((t) => t[0] === "title");
    if (!titleTag) {
      warnings.push('Calendar event should have a "title" tag');
    }

    // Validate event-specific requirements
    if (event.kind === 31922 || event.kind === 31923) {
      this.validateTimeBasedEvent(event, errors, warnings);
    } else if (event.kind === 31924) {
      this.validateCalendarList(event, errors, warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validates time-based events (31922, 31923)
   */
  private static validateTimeBasedEvent(
    event: NDKEvent,
    errors: string[],
    warnings: string[]
  ): void {
    const startTag = event.tags?.find((t) => t[0] === "start");
    if (!startTag) {
      errors.push('Time-based event must have a "start" tag');
    } else {
      const startTime = parseInt(startTag[1]);
      if (isNaN(startTime) || startTime <= 0) {
        errors.push("Start time must be a valid Unix timestamp");
      }
    }

    const endTag = event.tags?.find((t) => t[0] === "end");
    if (endTag) {
      const endTime = parseInt(endTag[1]);
      if (isNaN(endTime) || endTime <= 0) {
        errors.push("End time must be a valid Unix timestamp");
      } else if (startTag) {
        const startTime = parseInt(startTag[1]);
        if (!isNaN(startTime) && endTime <= startTime) {
          errors.push("End time must be after start time");
        }
      }
    }

    // Check for recurrence rule in kind 31923
    if (event.kind === 31923) {
      const rruleTag = event.tags?.find((t) => t[0] === "rrule");
      if (rruleTag && !rruleTag[1]?.startsWith("FREQ=")) {
        warnings.push("RRULE should follow RFC 5545 format");
      }
    }
  }

  /**
   * Validates calendar list (31924)
   */
  private static validateCalendarList(
    event: NDKEvent,
    errors: string[],
    warnings: string[]
  ): void {
    const aTags = event.tags?.filter((t) => t[0] === "a") || [];

    if (aTags.length === 0) {
      warnings.push(
        'Calendar should reference at least one event with "a" tags'
      );
    }

    aTags.forEach((aTag, index) => {
      if (!this.validateATag(aTag[1])) {
        errors.push(`Invalid "a" tag at index ${index}: ${aTag[1]}`);
      }
    });

    // Check for co-host tags
    const coHostTags =
      event.tags?.filter((t) => t[0] === "p" && t[3] === "co-host") || [];
    coHostTags.forEach((tag, index) => {
      if (!/^[0-9a-f]{64}$/.test(tag[1])) {
        errors.push(`Invalid co-host pubkey at index ${index}`);
      }

      if (tag[4]) {
        const permissions = tag[4].split(",");
        const validPermissions = ["create", "edit", "delete"];
        const invalidPerms = permissions.filter(
          (p) => !validPermissions.includes(p)
        );
        if (invalidPerms.length > 0) {
          errors.push(
            `Invalid co-host permissions at index ${index}: ${invalidPerms.join(", ")}`
          );
        }
      }
    });
  }

  /**
   * Validates NIP-26 delegation
   */
  static validateDelegation(event: NDKEvent): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const delegationTag = event.tags?.find((t) => t[0] === "delegation");
    if (!delegationTag) {
      return { isValid: true, errors, warnings }; // No delegation is valid
    }

    if (delegationTag.length < 4) {
      errors.push("Delegation tag must have at least 4 elements");
      return { isValid: false, errors, warnings };
    }

    const [, delegatorPubkey, conditions, token] = delegationTag;

    // Validate delegator pubkey
    if (!/^[0-9a-f]{64}$/.test(delegatorPubkey)) {
      errors.push("Delegator pubkey must be a valid 64-character hex string");
    }

    // Validate conditions format
    if (!conditions || typeof conditions !== "string") {
      errors.push("Delegation conditions must be a non-empty string");
    } else {
      const conditionPairs = conditions.split("&");
      for (const condition of conditionPairs) {
        if (!/^(kind|created_at)[<>=]+.+/.test(condition)) {
          warnings.push(
            `Potentially invalid delegation condition: ${condition}`
          );
        }
      }
    }

    // Validate token
    if (!token || typeof token !== "string") {
      errors.push("Delegation token must be a non-empty string");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validates NIP-19 encoded entities
   */
  static validateNip19Entity(encoded: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const decoded = nip19.decode(encoded);

      switch (decoded.type) {
        case "npub":
          if (!/^[0-9a-f]{64}$/.test(decoded.data as string)) {
            errors.push("Invalid pubkey in npub");
          }
          break;

        case "naddr":
          const addrData = decoded.data as any;
          if (typeof addrData.kind !== "number") {
            errors.push("naddr must contain a valid kind number");
          }
          if (!/^[0-9a-f]{64}$/.test(addrData.pubkey)) {
            errors.push("naddr must contain a valid pubkey");
          }
          if (!addrData.identifier || typeof addrData.identifier !== "string") {
            warnings.push("naddr should contain an identifier");
          }
          break;

        default:
          warnings.push(`Unsupported NIP-19 entity type: ${decoded.type}`);
      }
    } catch (error) {
      errors.push(`Invalid NIP-19 encoding: ${error}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validates a-tag format
   */
  private static validateATag(aTag: string): boolean {
    const parts = aTag.split(":");
    if (parts.length !== 3) return false;

    const [kind, pubkey, identifier] = parts;
    return (
      !isNaN(parseInt(kind)) &&
      /^[0-9a-f]{64}$/.test(pubkey) &&
      identifier.length > 0
    );
  }

  /**
   * Comprehensive validation for any event
   */
  static validateEvent(event: NDKEvent): ValidationResult {
    const results: ValidationResult[] = [];

    // Basic validation
    results.push(this.validateBasicEvent(event));

    // Calendar-specific validation
    const calendarKinds = [31922, 31923, 31924];
    if (calendarKinds.includes(event.kind!)) {
      results.push(this.validateCalendarEvent(event));
    }

    // Delegation validation
    results.push(this.validateDelegation(event));

    // Combine results
    const allErrors = results.flatMap((r) => r.errors);
    const allWarnings = results.flatMap((r) => r.warnings);

    return {
      isValid: allErrors.length === 0,
      errors: [...new Set(allErrors)], // Remove duplicates
      warnings: [...new Set(allWarnings)],
    };
  }
}
