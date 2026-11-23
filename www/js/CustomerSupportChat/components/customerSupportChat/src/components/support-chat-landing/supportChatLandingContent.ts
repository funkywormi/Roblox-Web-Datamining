/**
 * Copy for the landing, taken from the v5 mock. The wording is still open, so it stays
 * hardcoded English until it is moved into translation keys.
 */

export type CommonIssue = { text: string };

/** Choosing one sends its text as the visitor's first message. */
export const COMMON_ISSUES: readonly CommonIssue[] = [
  { text: "Account was hacked" },
  { text: "Report unauthorized charges" },
  { text: "Didn’t receive Robux" },
  { text: "Appeal a decision" },
];
