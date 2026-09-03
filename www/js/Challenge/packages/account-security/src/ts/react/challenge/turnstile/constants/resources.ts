import { TURNSTILE_LANGUAGE_RESOURCES } from "../app.config";

/**
 * A type adapted from the base type of `translate`, which we use to limit the
 * keys that can be translated.
 */
type TranslateFunction = (
  resourceId: (typeof TURNSTILE_LANGUAGE_RESOURCES)[number],
  parameters?: Record<string, unknown>,
) => string;

// IMPORTANT: Add resource keys to `app.config.ts` as well.
export const getResources = (translate: TranslateFunction) =>
  ({
    Description: {
      VerifyingYouAreNotBot: translate("Description.VerifyingYouAreNotBot"),
    },
  }) as const;

export type TurnstileResources = ReturnType<typeof getResources>;
