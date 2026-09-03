import { urlService } from "core-utilities";

export const giftCardTermsURL = "http://www.roblox.com/giftcardterms";

export const privacyPolicyURL = (locale: string) => {
  return urlService.getUrlWithLocale("/info/privacy", locale);
};

export const termsOfUseURL = (locale: string) => {
  return urlService.getUrlWithLocale("/info/terms", locale);
};
