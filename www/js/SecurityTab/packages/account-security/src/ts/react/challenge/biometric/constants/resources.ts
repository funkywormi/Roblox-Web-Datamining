import type { Translator } from "@rbx/www-common/i18n";

export const getResources = (
  translate: Translator<"Feature.BiometricChallenge">,
  translateCommon: Translator<"CommonUI.Messages">,
) =>
  ({
    personaLiveness: {
      title: translate("Title.ConfirmHuman"),
      content: translate("Content.LivenessHostedPrompt"),
      loading: translate("Content.Loading"),
      cancelButton: translate("Action.Cancel"),
      continueButton: translate("Action.Continue"),
      closeAffordance: translateCommon("Action.Close"),
      qrTitle: translate("Title.QRHandoff"),
      qrDescription: translate("Content.ScanQR"),
      qrFooter: translate("Content.QRHelpFull", {
        prompt: `<b>${translate("Content.QRHelpPrompt")}</b>`,
      }),
    },
  }) as const;

export type BiometricResources = ReturnType<typeof getResources>;
