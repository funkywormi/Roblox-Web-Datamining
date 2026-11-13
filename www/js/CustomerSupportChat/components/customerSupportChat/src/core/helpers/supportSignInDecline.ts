const SIGN_IN_DECLINED_KEY = "RobloxSupportSignInDeclined";

/** Kept for this browser tab, so leaving /support and coming back stays past the gate. */
export const hasDeclinedSupportSignIn = (): boolean =>
  sessionStorage.getItem(SIGN_IN_DECLINED_KEY) === "1";

export const declineSupportSignIn = (): void => {
  sessionStorage.setItem(SIGN_IN_DECLINED_KEY, "1");
};
