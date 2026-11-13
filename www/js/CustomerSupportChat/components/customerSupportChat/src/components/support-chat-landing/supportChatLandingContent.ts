import type { TIconProps } from "@rbx/foundation-ui";

/**
 * Copy for the landing, taken from the v5 mock. The wording is still open, so it stays
 * hardcoded English until it is moved into translation keys.
 */

type TIconName = TIconProps["name"];

export type CommonIssue = { text: string; iconName: TIconName };

/** Choosing one sends its text as the visitor's first message. */
export const COMMON_ISSUES: readonly CommonIssue[] = [
  { text: "My account was hacked", iconName: "icon-regular-shield-lock" },
  { text: "I see a charge I don’t recognize", iconName: "icon-regular-credit-card" },
  { text: "I need to delete my account", iconName: "icon-regular-trash-can" },
  { text: "I need to appeal a moderation action", iconName: "icon-regular-flag" },
];
