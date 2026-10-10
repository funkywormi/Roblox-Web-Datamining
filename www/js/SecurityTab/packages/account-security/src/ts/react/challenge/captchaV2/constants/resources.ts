import type { Translator } from "@rbx/www-common/i18n";

export const getResources = (translate: Translator<"Feature.CaptchaV2Challenge">) =>
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
