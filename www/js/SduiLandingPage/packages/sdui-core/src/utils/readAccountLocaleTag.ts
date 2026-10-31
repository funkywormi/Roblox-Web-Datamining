import { getLocaleFromDocument } from "@rbx/www-common/intl";
import { localeToUppercaseDash } from "@rbx/www-common/locale";

/**
 * BCP-47 tag for the account language on the document, such as `en-US`.
 * Falls back to `en-US` when `document` is missing.
 */
export function readAccountLocaleTag(): string {
  return localeToUppercaseDash(getLocaleFromDocument());
}
