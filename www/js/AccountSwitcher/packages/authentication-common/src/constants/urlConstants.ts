import environmentUrls from "@rbx/environment-urls";

export const getRefreshSessionUrl = (): string => `${environmentUrls.authApi}/v2/session/refresh`;

// same with url constants in angular core utilities
export const urlQueryConstants = {
  urlQueryStringPrefix: "?",
  urlQueryParameterSeparator: "&",
  hashSign: "#",
  atSign: "@",
};

export const verifiedSignupUrl = {
  verifiedSignupChallenge: "/v1/verified-signup/challenge",
  verifiedSignupVoucher: "/v1/verified-signup/voucher",
  verifiedSignup: "/v1/verified-signup",
};

export const passkeyUrl = {
  startAuthentication: "/v1/passkey/StartAuthentication",
};
