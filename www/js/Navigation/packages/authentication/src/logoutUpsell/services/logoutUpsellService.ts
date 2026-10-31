import { AddEmailTranslations } from "../components/AddEmailContent";
import { VerifyEmailTranslations } from "../components/VerifyEmailContent";
import { PasskeyUpsellTranslations } from "../components/PasskeyUpsellContent";
import {
  ClientAttributes,
  getLogoutPrompt,
  LogoutPrompt,
  recordLogoutPromptImpression,
} from "./logoutPromptApi";
import type {
  EmailLogoutUpsellOptions,
  PasskeyLogoutUpsellOptions,
} from "../components/LogoutUpsellFlow";

/**
 * Single entry point for the logout upsell flow.
 *
 * Behavior:
 *   1. Read the prompts-service flag from IXP (`Website.LogoutUpsell` /
 *      `IsPromptsServiceEnabled`). If it's disabled in IXP, or IXP errors out
 *      or is unreachable, fall back to the legacy email upsell handler — it
 *      runs the legacy `IsEmailUpsellAtLogoutEnabled` + email-status checks
 *      and that preserves today's logout behavior.
 *   2. When prompts service is enabled, ask the modals service for an eligible
 *      logout prompt and dispatch on `promptType`:
 *        - `LogoutEmailUpsellV1` → record an impression and ask the host to
 *          open its email upsell modal. The
 *          prompts service has already decided this user should see the
 *          modal, so we skip the legacy eligibility checks (metadata flag +
 *          email-status GET) and just render.
 *        - `LogoutPasskeyUpsellV1` → record an impression, build a
 *          `PasskeyUpsellTranslations` from `prompt.translations`, and mount
 *          the passkey upsell modal. The presence of a `secondaryButton`
 *          translation toggles the "Add email" CTA; when set, we also build
 *          `AddEmailTranslations` and `VerifyEmailTranslations` maps (same
 *          prompt translations, different keys) and the modal owns the
 *          in-place page transitions: passkey → add email → verify email.
 *        - Anything else (including no prompt) → log out directly. New prompt
 *          types render by adding a branch to `dispatchPrompt`.
 */

// From modals-eligibility-service config
const PROMPT_TYPE_LOGOUT_EMAIL_UPSELL_V1 = "LogoutEmailUpsellV1";
const PROMPT_TYPE_LOGOUT_PASSKEY_UPSELL_V1 = "LogoutPasskeyUpsellV1";

export type ShowEmailUpsellOptions = Omit<EmailLogoutUpsellOptions, "kind">;
export type ShowPasskeyUpsellOptions = Omit<PasskeyLogoutUpsellOptions, "kind">;

export type HandleLogoutUpsellOptions = {
  /** Called when the upsell flow is finished and the page should log out. */
  onLogout: () => void;
  /**
   * Opens the passkey upsell modal. Each host passes its own mount, e.g. the .NET nav passes
   * `showPasskeyUpsellModal`, so this module doesn't import a host-specific mount.
   */
  showPasskeyUpsell: (options: ShowPasskeyUpsellOptions) => void;
  /** Opens the email-only prompt selected by prompts service. */
  showEmailUpsell: (options: ShowEmailUpsellOptions) => void;
  /** Reads the host's IXP implementation. */
  isPromptsServiceEnabled: () => Promise<boolean>;
  /** Checks whether this host can complete WebAuthn registration. */
  browserSupportsPasskey: () => Promise<boolean>;
  /** Preserves the metadata/email-status gated fallback when prompts service is off. */
  runLegacyEmailUpsell: (onLogout: () => void) => void | Promise<void>;
};

// Capabilities advertised to the prompts service so its eligibility resolvers
// don't select an upsell this client can't render. `capableUpsells` is
// "PasskeyV1" when the client can register a passkey, and "" otherwise — the
// prompts service reads the empty value as "passkey upsell unavailable here".
const buildClientAttributes = async (
  browserSupportsPasskey: () => Promise<boolean>,
): Promise<ClientAttributes> => ({
  capableUpsells: (await browserSupportsPasskey()) ? "PasskeyV1" : "",
});

const buildPasskeyTranslations = (
  promptTranslations: Record<string, string>,
  { withEmail }: { withEmail: boolean },
): PasskeyUpsellTranslations => {
  const base: PasskeyUpsellTranslations = {
    title: promptTranslations.title ?? "",
    body: promptTranslations.body ?? "",
    addPasskeyLabel: promptTranslations.primaryButton ?? "",
    signOutLabel: promptTranslations.tertiaryButton ?? "",
    closeLabel: promptTranslations.closeLabel ?? "",
  };
  if (withEmail) {
    base.addEmailLabel = promptTranslations.secondaryButton ?? "";
  }
  return base;
};

const buildAddEmailTranslations = (
  promptTranslations: Record<string, string>,
): AddEmailTranslations => {
  return {
    title: promptTranslations.addEmailTitle ?? "",
    body: promptTranslations.addEmailBody ?? "",
    placeholder: promptTranslations.addEmailPlaceholder ?? "",
    continueLabel: promptTranslations.addEmailPrimaryButton ?? "",
  };
};

const buildVerifyEmailTranslations = (
  promptTranslations: Record<string, string>,
): VerifyEmailTranslations => {
  return {
    title: promptTranslations.verifyEmailTitle ?? "",
    body: promptTranslations.verifyEmailBody ?? "",
    resendLabel: promptTranslations.verifyEmailPrimaryButton ?? "",
    continueLabel: promptTranslations.verifyEmailSecondaryButton ?? "",
    changeEmailLabel: promptTranslations.verifyEmailTertiaryButton ?? "",
  };
};

const dispatchPasskeyUpsell = (
  prompt: LogoutPrompt,
  { onLogout, showPasskeyUpsell }: HandleLogoutUpsellOptions,
): void => {
  const withEmail = Boolean(prompt.translations.secondaryButton);
  recordLogoutPromptImpression(prompt.promptType);
  showPasskeyUpsell({
    translations: buildPasskeyTranslations(prompt.translations, { withEmail }),
    showAddEmail: withEmail,
    addEmailTranslations: withEmail ? buildAddEmailTranslations(prompt.translations) : undefined,
    verifyEmailTranslations: withEmail
      ? buildVerifyEmailTranslations(prompt.translations)
      : undefined,
    onLogout,
  });
};

const dispatchPrompt = (prompt: LogoutPrompt, options: HandleLogoutUpsellOptions): void => {
  switch (prompt.promptType) {
    case PROMPT_TYPE_LOGOUT_EMAIL_UPSELL_V1:
      recordLogoutPromptImpression(prompt.promptType);
      options.showEmailUpsell({
        closeLabel: prompt.translations.closeLabel ?? "",
        addEmailTranslations: buildAddEmailTranslations(prompt.translations),
        verifyEmailTranslations: buildVerifyEmailTranslations(prompt.translations),
        onLogout: options.onLogout,
      });
      return;
    case PROMPT_TYPE_LOGOUT_PASSKEY_UPSELL_V1:
      dispatchPasskeyUpsell(prompt, options);
      return;
    default:
      options.onLogout();
  }
};

export const handleLogoutUpsell = async (options: HandleLogoutUpsellOptions): Promise<void> => {
  const { browserSupportsPasskey, isPromptsServiceEnabled, onLogout, runLegacyEmailUpsell } =
    options;
  const enabled = await isPromptsServiceEnabled();
  if (!enabled) {
    await runLegacyEmailUpsell(onLogout);
    return;
  }

  const prompt = await getLogoutPrompt(await buildClientAttributes(browserSupportsPasskey));
  if (!prompt) {
    onLogout();
    return;
  }

  dispatchPrompt(prompt, options);
};
