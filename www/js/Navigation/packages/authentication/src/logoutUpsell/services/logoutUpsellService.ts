import { hybridResponseService } from "core-roblox-utilities";
// @ts-expect-error - Legacy Roblox module types
import { EmailVerificationService } from "@rbx/core-scripts/legacy/Roblox";
import ExperimentationService from "@rbx/experimentation";
import {
  defaultNotInApp,
  isPasskeyCompatible,
} from "@rbx/authentication-common/passkey/compatibility";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { AddEmailTranslations } from "../components/AddEmailContent";
import { VerifyEmailTranslations } from "../components/VerifyEmailContent";
import { PasskeyUpsellTranslations } from "../components/PasskeyUpsellContent";
import {
  ClientAttributes,
  getLogoutPrompt,
  LogoutPrompt,
  recordLogoutPromptImpression,
} from "./logoutPromptApi";
import {
  LogoutUpsellClientError,
  PasskeyEligibilityDecision,
  sendLogoutUpsellClientError,
  sendPasskeyEligibilityDecision,
} from "./logoutUpsellEvents";
import { isPlatformAuthenticatorAvailable } from "./platformAuthenticatorAvailability";
import { showPasskeyUpsellModal } from "./showPasskeyUpsellModal";

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
 *        - `LogoutEmailUpsellV1` → record an impression and open the legacy
 *          email upsell modal directly via `openLogoutEmailUpsellModal`. The
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

const LOGOUT_UPSELL_LAYER = "Website.LogoutUpsell";

// From modals-eligibility-service config
const PROMPT_TYPE_LOGOUT_EMAIL_UPSELL_V1 = "LogoutEmailUpsellV1";
const PROMPT_TYPE_LOGOUT_PASSKEY_UPSELL_V1 = "LogoutPasskeyUpsellV1";

export type HandleLogoutUpsellOptions = {
  /** Called when the upsell flow is finished and the page should log out. */
  onLogout: () => void;
};

const browserSupportsPasskey = (): Promise<boolean> =>
  isPasskeyCompatible({
    producer: () => getDeviceMeta() ?? defaultNotInApp(),
    hybridCallback: () =>
      hybridResponseService.getNativeResponse(
        hybridResponseService.FeatureTarget.CREDENTIALS_PROTOCOL_AVAILABLE,
        {},
        2000,
      ),
    platformAuthenticatorCheck: async () => {
      const available = await isPlatformAuthenticatorAvailable();
      sendPasskeyEligibilityDecision(
        available
          ? PasskeyEligibilityDecision.Capable
          : PasskeyEligibilityDecision.ExcludedNoPlatformAuthenticator,
      );
      return available;
    },
  });

// Capabilities advertised to the prompts service so its eligibility resolvers
// don't select an upsell this client can't render. `capableUpsells` is
// "PasskeyV1" when the client can register a passkey, and "" otherwise — the
// prompts service reads the empty value as "passkey upsell unavailable here".
const buildClientAttributes = async (): Promise<ClientAttributes> => ({
  capableUpsells: (await browserSupportsPasskey()) ? "PasskeyV1" : "",
});

const isPromptsServiceEnabled = async (): Promise<boolean> => {
  try {
    const ixp = await ExperimentationService.getAllValuesForLayer(LOGOUT_UPSELL_LAYER);
    return ixp?.IsPromptsServiceEnabled === true;
  } catch {
    return false;
  }
};

// This includes the legacy email service & authAPI checks that get skipped if
// prompts service is enabled
const runLegacyEmailUpsell = (onLogout: () => void): void => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-floating-promises -- untyped legacy module
  EmailVerificationService?.handleUserEmailUpsellAtLogout(onLogout).then(
    (data: { emailAddress?: string } | null | undefined) => {
      if (!data || data.emailAddress) {
        onLogout();
      }
    },
  );
};

// Skips email service & authAPI checks (done by prompts service)
const openLegacyEmailUpsellModal = (onLogout: () => void): void => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- untyped legacy module
  const openModal = EmailVerificationService?.openLogoutEmailUpsellModal as
    | ((skipCallback: () => void) => Promise<void> | void)
    | undefined;
  if (typeof openModal !== "function") {
    // if new method is missing due to cached bundle, fall back to legacy path
    sendLogoutUpsellClientError(LogoutUpsellClientError.LegacyModalEntrypointMissing);
    runLegacyEmailUpsell(onLogout);
    return;
  }
  const failOpen = () => {
    sendLogoutUpsellClientError(LogoutUpsellClientError.LegacyModalOpenFailed);
    onLogout();
  };
  try {
    Promise.resolve(openModal(onLogout)).catch(failOpen);
  } catch {
    failOpen();
  }
};

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

const dispatchPasskeyUpsell = (prompt: LogoutPrompt, onLogout: () => void): void => {
  const withEmail = Boolean(prompt.translations.secondaryButton);
  recordLogoutPromptImpression(prompt.promptType);
  showPasskeyUpsellModal({
    translations: buildPasskeyTranslations(prompt.translations, { withEmail }),
    showAddEmail: withEmail,
    addEmailTranslations: withEmail ? buildAddEmailTranslations(prompt.translations) : undefined,
    verifyEmailTranslations: withEmail
      ? buildVerifyEmailTranslations(prompt.translations)
      : undefined,
    onLogout,
  });
};

const dispatchPrompt = (prompt: LogoutPrompt, onLogout: () => void): void => {
  switch (prompt.promptType) {
    case PROMPT_TYPE_LOGOUT_EMAIL_UPSELL_V1:
      recordLogoutPromptImpression(prompt.promptType);
      openLegacyEmailUpsellModal(onLogout);
      return;
    case PROMPT_TYPE_LOGOUT_PASSKEY_UPSELL_V1:
      dispatchPasskeyUpsell(prompt, onLogout);
      return;
    default:
      onLogout();
  }
};

export const handleLogoutUpsell = async ({
  onLogout,
}: HandleLogoutUpsellOptions): Promise<void> => {
  const enabled = await isPromptsServiceEnabled();
  if (!enabled) {
    runLegacyEmailUpsell(onLogout);
    return;
  }

  const prompt = await getLogoutPrompt(await buildClientAttributes());
  if (!prompt) {
    onLogout();
    return;
  }

  dispatchPrompt(prompt, onLogout);
};
