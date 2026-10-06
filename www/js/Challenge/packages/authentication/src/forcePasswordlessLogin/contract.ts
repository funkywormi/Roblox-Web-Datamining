/**
 * The contract between the force passwordless login challenge (account-security) and the login
 * page (LoginBase) it renders over.
 */

/**
 * The challenge dispatches `shown`, `hidden`, `useEmailOtp` and `usePasskey`; the login page
 * dispatches `loginFailed` and `emailOtpClosed`.
 */
export const forcePasswordlessLoginEvents = {
  shown: "ForcePasswordlessLoginChallengeShown",
  hidden: "ForcePasswordlessLoginChallengeHidden",
  loginFailed: "ForcePasswordlessLoginFailed",
  useEmailOtp: "ForcePasswordlessLoginUseEmailOtp",
  emailOtpClosed: "ForcePasswordlessLoginEmailOtpClosed",
  usePasskey: "ForcePasswordlessLoginUsePasskey",
} as const;

type LoginPageSupport = {
  isEmailOtpOffered: boolean;
  isPasskeyOffered: boolean;
};

/** Rendered by the login page on its `#login-base` root to say what the challenge may offer. */
export const getLoginPageSupportAttributes = ({
  isEmailOtpOffered,
  isPasskeyOffered,
}: LoginPageSupport) => ({
  "data-force-passwordless-login-ready": "true",
  "data-force-passwordless-login-email-otp-enabled": String(isEmailOtpOffered),
  "data-force-passwordless-login-passkey-enabled": String(isPasskeyOffered),
});

/** Read by the challenge; `isReady` is false anywhere but the login page. */
export const readLoginPageSupport = (): LoginPageSupport & { isReady: boolean } => {
  const dataset = document.getElementById("login-base")?.dataset;
  return {
    isReady: dataset?.forcePasswordlessLoginReady === "true",
    isEmailOtpOffered: dataset?.forcePasswordlessLoginEmailOtpEnabled === "true",
    isPasskeyOffered: dataset?.forcePasswordlessLoginPasskeyEnabled === "true",
  };
};
