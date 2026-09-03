import { OAuthAbuseCategory, TAbuseReason } from "../../../types/abuseReportTypes";

export enum OIDCScopeTypes {
  OpenId = "openid",
  Profile = "profile",
  Email = "email",
}

const appPermissionsConstants = {
  pagerConstants: {
    pageSize: 5,
    loadPageSize: 10,
  },
  oidcScopeTranslationKeys: {
    [OIDCScopeTypes.OpenId]: "ScopeType.OpenId",
    [OIDCScopeTypes.Profile]: "ScopeType.Profile",
    [OIDCScopeTypes.Email]: "ScopeType.Email",
  },
};

export const abuseReasons: TAbuseReason[] = [
  {
    category: OAuthAbuseCategory.AccountTheft,
    labelTranslationKey: "Label.ReportOAuthAccountTheft",
  },
  {
    category: OAuthAbuseCategory.AskPrivateInfo,
    labelTranslationKey: "Label.ReportOAuthAskPrivateInfo",
  },
  {
    category: OAuthAbuseCategory.InaccurateDescription,
    labelTranslationKey: "Label.ReportOAuthInaccurateDescription",
  },
  {
    category: OAuthAbuseCategory.InappropriateContent,
    labelTranslationKey: "Label.ReportOAuthInappropriateContent",
  },
  {
    category: OAuthAbuseCategory.InappropriateLanguage,
    labelTranslationKey: "Label.ReportOAuthInappropriateLanguage",
  },
  {
    category: OAuthAbuseCategory.InappropriateUserDataUsage,
    labelTranslationKey: "Label.ReportOAuthInappropriateUserDataUsage",
  },
  {
    category: OAuthAbuseCategory.Other,
    labelTranslationKey: "Label.ReportOAuthOther",
  },
];

export const oauthAbuseReportVector = "oauth_application";
export const oauthAbuseReportEntryPoint = "web";

export default appPermissionsConstants;
