export const mobileWebSignupMetaTagName = "mobile-web-signup-data";

export const isMobileWebSignup = (): boolean =>
  document.querySelector<HTMLElement>(`meta[name="${mobileWebSignupMetaTagName}"]`)?.dataset
    .isMobileWebSignup === "true";
