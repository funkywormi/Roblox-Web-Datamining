import * as hybridResponseService from "@rbx/core-scripts/auth/hybrid-response";
import { window as browserWindow } from "@rbx/core-lib/browser";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import ExperimentationService from "@rbx/experimentation";
import {
  defaultNotInApp,
  isPasskeyCompatible,
} from "@rbx/authentication-common/passkey/compatibility";
import {
  LogoutUpsellClientError,
  PasskeyEligibilityDecision,
  sendLogoutUpsellClientError,
  sendPasskeyEligibilityDecision,
} from "./logoutUpsellEvents";
import { isPlatformAuthenticatorAvailable } from "./platformAuthenticatorAvailability";

const logoutUpsellLayer = "Website.LogoutUpsell";

type LegacyEmailVerificationService = {
  handleUserEmailUpsellAtLogout?: (
    onLogout: () => void,
  ) => Promise<{ emailAddress?: string } | null | undefined>;
  openLogoutEmailUpsellModal?: (skipCallback: () => void) => Promise<void> | void;
};

const getEmailVerificationService = (): LegacyEmailVerificationService | undefined => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- legacy bundle global
  const legacyWindow = browserWindow as
    | (Window & { Roblox?: { EmailVerificationService?: LegacyEmailVerificationService } })
    | undefined;
  return legacyWindow?.Roblox?.EmailVerificationService;
};

export const isLegacyPromptsServiceEnabled = async (): Promise<boolean> => {
  try {
    const ixp = await ExperimentationService.getAllValuesForLayer(logoutUpsellLayer);
    return ixp?.IsPromptsServiceEnabled === true;
  } catch {
    return false;
  }
};

export const legacyBrowserSupportsPasskey = (): Promise<boolean> =>
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

export const runLegacyEmailUpsell = (onLogout: () => void): void => {
  const handler = getEmailVerificationService()?.handleUserEmailUpsellAtLogout;
  if (typeof handler !== "function") {
    onLogout();
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-floating-promises -- legacy contract; modal owns flow
  handler(onLogout).then(data => {
    if (!data || data.emailAddress) {
      onLogout();
    }
  });
};

export const openLegacyEmailUpsellModal = (onLogout: () => void): void => {
  const openModal = getEmailVerificationService()?.openLogoutEmailUpsellModal;
  if (typeof openModal !== "function") {
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
