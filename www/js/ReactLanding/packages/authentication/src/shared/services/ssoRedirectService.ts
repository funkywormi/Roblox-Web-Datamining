import { EnvironmentUrls } from "@rbx/environment-urls";
import type { SsoProvider } from "../types/ssoTypes";
import { authFailureReason, type AuthFlowTelemetry } from "../telemetry/authFlowTelemetry";
import {
  sendSsoClientErrorEvent,
  ssoClientErrorReasons,
  ssoTelemetryMethods,
  startSsoAttempt,
} from "./ssoTelemetryService";

export type { SsoProvider } from "../types/ssoTypes";

export type SsoIdentityProviderIds = Partial<Record<SsoProvider, number>>;

const supportedProviders: readonly SsoProvider[] = ["google", "apple"];
const webRedirectIntentId = "web-redirect";
const popupWidth = 480;
const popupHeight = 720;

const buildCenteredPopupFeatures = (): string => {
  // window.open positions on the whole virtual desktop, so center within the
  // monitor's available area including its availLeft/availTop offset.
  // availLeft/availTop are non-standard and absent from TS's Screen type.
  const screen = window.screen as Screen & {
    availLeft?: number;
    availTop?: number;
  };
  const { availLeft = 0, availTop = 0, availWidth, availHeight } = screen;
  const left = Math.round(availLeft + (availWidth - popupWidth) / 2);
  const top = Math.round(availTop + (availHeight - popupHeight) / 2);
  return `width=${popupWidth},height=${popupHeight},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`;
};

const isSupportedProvider = (provider: string): provider is SsoProvider =>
  supportedProviders.includes(provider as SsoProvider);

const getAuthApiUrl = (): string => EnvironmentUrls.authApi.replace(/\/+$/, "");

export const isValidIdentityProviderId = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value > 0;

export const buildSsoOAuthInitUrl = (
  provider: SsoProvider,
  identityProviderIds: SsoIdentityProviderIds,
): string => {
  if (!isSupportedProvider(provider)) {
    throw new Error(`Unsupported SSO provider: ${String(provider)}`);
  }

  const identityProviderId = identityProviderIds[provider];
  if (!isValidIdentityProviderId(identityProviderId)) {
    throw new Error(`Missing or invalid identity provider ID for ${provider}`);
  }

  return `${getAuthApiUrl()}/v1/external/${identityProviderId}/sso/oauth/init?postAuthenticationIntentId=${webRedirectIntentId}`;
};

/**
 * `ctx` is the event context of the page the user started from, and `telemetry` is that page's
 * auth flow telemetry. The outcome isn't reported here: authentication completes in the SSO
 * popup, and its handoff message settles the attempt.
 */
export const redirectToSsoProvider = (
  provider: SsoProvider,
  identityProviderIds: SsoIdentityProviderIds,
  ctx: string,
  telemetry: AuthFlowTelemetry,
  navigate: (url: string) => void = url => {
    // A popup blocker (or a COOP severance mid-chain) can make window.open return null;
    // fall back to a same-window redirect so the click still goes somewhere.
    const popup = window.open(url, "roblox-sso", buildCenteredPopupFeatures());
    if (popup == null) {
      sendSsoClientErrorEvent(ctx, provider, ssoClientErrorReasons.popupBlocked);
      window.location.assign(url);
    }
  },
): void => {
  const method = ssoTelemetryMethods[provider];
  telemetry.primaryActionClicked(method);

  let url: string;
  try {
    url = buildSsoOAuthInitUrl(provider, identityProviderIds);
  } catch (error) {
    telemetry.submissionBlocked(method, authFailureReason.clientValidation);
    sendSsoClientErrorEvent(ctx, provider, ssoClientErrorReasons.invalidConfig);
    throw error;
  }
  telemetry.requestStarted(method);
  startSsoAttempt(provider, ctx, telemetry);
  navigate(url);
};
