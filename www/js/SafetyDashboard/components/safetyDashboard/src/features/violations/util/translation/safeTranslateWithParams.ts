import type { TranslateFn } from "@rbx/translation-utils";
import { sendMissingTranslationEvent } from "../../../../telemetry/appealsEvents";

/**
 * Attempt to translate a key with parameters. If the translation throws (e.g. the
 * translation string expects a parameter not present in `params`), fall back to
 * translating without parameters.
 *
 * This returns the raw template string (e.g. "Your {account} has been...") which is
 * imperfect but human-readable, rather than crashing the page.
 */
const safeTranslateWithParams = (
  translate: TranslateFn,
  key: string,
  params: Record<string, string> | undefined,
): string => {
  if (!params) return translate(key);

  try {
    return translate(key, params);
  } catch {
    sendMissingTranslationEvent({ key, params });
    return translate(key);
  }
};

export default safeTranslateWithParams;
