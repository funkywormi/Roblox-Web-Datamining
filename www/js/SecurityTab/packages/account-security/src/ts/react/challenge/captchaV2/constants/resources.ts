import { CAPTCHA_V2_LANGUAGE_RESOURCES } from "../app.config";

/**
 * A type adapted from the base type of `translate`, which we use to limit the
 * keys that can be translated.
 */
type TranslateFunction = (
  resourceId: (typeof CAPTCHA_V2_LANGUAGE_RESOURCES)[number],
  parameters?: Record<string, unknown>,
) => string;

// IMPORTANT: Add resource keys to `app.config.ts` as well.
export const getResources = (translate: TranslateFunction) =>
  ({
    Title: {
      VerifyHuman: translate("Title.VerifyHuman"),
    },
    Content: {
      HoldToConfirm: translate("Content.HoldToConfirm"),
      TryAgain: translate("Content.TryAgain"),
      // Parameterized: the `{id}` placeholder is filled with the reference id.
      ReferenceID: (id: string) => translate("Content.ReferenceID", { id }),
    },
    Action: {
      PressAndHold: translate("Action.PressAndHold"),
    },
    Label: {
      Cancel: translate("Label.Cancel"),
    },
  }) as const;

export type CaptchaV2Resources = ReturnType<typeof getResources>;
