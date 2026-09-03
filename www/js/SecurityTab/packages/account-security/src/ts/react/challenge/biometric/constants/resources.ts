import { BIOMETRIC_LANGUAGE_RESOURCES } from "../app.config";

/**
 * A type adapted from the base type of `translate`, which we use to limit the
 * keys that can be translated.
 */
type TranslateFunction = (
  resourceId: (typeof BIOMETRIC_LANGUAGE_RESOURCES)[number],
  parameters?: Record<string, unknown>,
) => string;

export const getResources = (translate: TranslateFunction) =>
  ({
    personaLiveness: {
      title: translate("Title.ConfirmHuman"),
      content: translate("Content.LivenessHostedPrompt"),
      loading: translate("Content.Loading"),
      cancelButton: translate("Action.Cancel"),
      continueButton: translate("Action.Continue"),
      closeAffordance: translate("Action.Close"),
      qrTitle: translate("Title.QRHandoff"),
      qrDescription: translate("Content.ScanQR"),
      qrFooter: translate("Content.QRHelpFull", {
        prompt: `<b>${translate("Content.QRHelpPrompt")}</b>`,
      }),
    },
  }) as const;

export type BiometricResources = ReturnType<typeof getResources>;
