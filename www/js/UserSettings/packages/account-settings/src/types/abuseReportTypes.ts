export interface ReportedTags {
  [key: string]: {
    valueList: [
      {
        data: string;
      },
    ];
  };
}

export interface SafetyEvent {
  safetyEvent: {
    tags: ReportedTags;
  };
}

export enum OAuthAbuseCategory {
  InappropriateLanguage = "ABUSE_CATEGORY_INAPPROPRIATE_LANGUAGE",
  AskPrivateInfo = "ABUSE_CATEGORY_ASKED_FOR_PRIVATE_INFO",
  InappropriateUserDataUsage = "ABUSE_CATEGORY_INAPPROPRIATE_USER_DATA_USAGE",
  AccountTheft = "ABUSE_CATEGORY_ACCOUNT_THEFT",
  InappropriateContent = "ABUSE_CATEGORY_INAPPROPRIATE_CONTENT",
  InaccurateDescription = "ABUSE_CATEGORY_INACCURATE_DESCRIPTION_OF_REQUESTED_PERMISSIONS",
  Other = "ABUSE_CATEGORY_OTHER",
}

export type TAbuseReason = {
  category: OAuthAbuseCategory;
  labelTranslationKey: string;
};
