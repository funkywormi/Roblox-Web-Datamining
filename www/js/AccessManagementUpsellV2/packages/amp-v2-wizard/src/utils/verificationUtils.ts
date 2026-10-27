/** Shared helpers for handing a user off to an identity-verification vendor. */

import { getLocale } from "./locale";

/** Sends the user to a vendor's hosted page, carrying locale and style so it matches the app. */
export default function openVerificationLink(
  verificationLink: string,
  styleVariant?: string | null,
): void {
  const locale = getLocale();
  let url = verificationLink;
  if (locale) {
    url = `${url}&language=${locale}`;
  }
  if (styleVariant) {
    url = `${url}&style-variant=${styleVariant}`;
  }
  window.location.href = url;
}
