import { EventTypes } from "../telemetry/analytics";
import type { TranslateFunction } from "../providers/types";

type SendEventFn = (
  eventType: EventTypes,
  additionalProperties?: Record<string, string | number | boolean>,
) => void;

/**
 * Attempt to translate a key with parameters. If the translation throws (e.g. the
 * translation string expects a parameter not present in `params`), fall back to
 * translating without parameters.
 *
 * This returns the raw template string (e.g. "Your {account} has been...") which is
 * imperfect but human-readable, rather than crashing the page.
 */
const safeTranslateWithParams = (
  translate: TranslateFunction,
  key: string,
  params: Record<string, string> | undefined,
  sendEvent?: SendEventFn,
): string => {
  if (!params) return translate(key);

  try {
    return translate(key, params);
  } catch {
    sendEvent?.(EventTypes.MissingTranslation, {
      additionalInfo: JSON.stringify({ key, params }),
    });
    return translate(key);
  }
};

export default safeTranslateWithParams;
