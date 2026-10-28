import {
  getParentEmailTokenMetricsType,
  ParentEmailTokenRedemptionResult,
  ParentEmailTokenSurface,
  ParentEmailTokenType,
  sendParentEmailTokenOpenedEventOnce,
  sendParentEmailTokenRedemptionEvent,
} from "@rbx/authentication-common/utils/parentEmailTokenRedemptionUtils";

const getSignupTokenEvent = (dataToken: string) => ({
  token: dataToken,
  tokenType: ParentEmailTokenType.PasswordlessSignup,
  metricsType: getParentEmailTokenMetricsType(
    `${window.location.pathname}${window.location.search}`,
  ),
  surface: ParentEmailTokenSurface.Signup,
});

/** Sends opened once per token, since the sign up page keeps `dataToken` in its URL on reload. */
export const sendSignupTokenOpenedEvent = (dataToken: string): Promise<void> =>
  sendParentEmailTokenOpenedEventOnce(getSignupTokenEvent(dataToken));

export const sendSignupTokenRedemptionEvent = (
  dataToken: string,
  result: ParentEmailTokenRedemptionResult,
): Promise<void> =>
  sendParentEmailTokenRedemptionEvent({ ...getSignupTokenEvent(dataToken), result });
