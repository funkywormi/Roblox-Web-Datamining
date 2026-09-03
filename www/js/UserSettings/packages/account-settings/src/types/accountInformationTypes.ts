import { TSecureAuthIntent } from "core-roblox-utilities";
import { UserPrivacyLevel } from "@rbx/user-settings";
import Gender from "../enums/Gender";
import { UsernameResponseErrorCode } from "../enums/errorCodes";
import { TDropdownOption } from "./commonTypes";

export enum ApiRequestStatus {
  error = "error",
  loading = "loading",
  success = "success",
}

export type TApiHookResult<T> = {
  status: ApiRequestStatus;
  data?: T;
};

export type TUserBirthdate = {
  [key: string]: number;
  birthMonth: number;
  birthDay: number;
  birthYear: number;
};

export type BirthdateDropdownOption = {
  [key: string]: unknown;
  id: string;
  class: string;
  name: string;
  options: TDropdownOption[];
  currentValue?: number;
};

export type TGetVerifiedAgeBody = {
  isVerified: boolean;
  verifiedAge: number;
  isSeventeenPlus: boolean;
};

export enum BirthdatePart {
  year = "Year",
  month = "Month",
  day = "Day",
}

export type TDisplayNameParams = {
  userId: number;
  newDisplayName: string;
  showAgedUpDisplayName: boolean;
};

export type TDisplayNameMeta = {
  showAgedUpDisplayName: boolean;
};

export type TGenderBody = { gender: Gender };

export type Fido2Credential = {
  nickname: string;
};

export type TListCredentialsParams = {
  all: boolean;
};

export type TListCredentialsBody = {
  credentials: Fido2Credential[];
};

export type TAuthMetadataBody = {
  IsPasskeyFeatureEnabled: boolean;
};

export type TPhoneResponse = {
  canBypassPasswordForPhoneUpdate: boolean;
  countryCode: string;
  isVerified: boolean;
  phone: string;
  prefix: string;
  verificationCodeLength: number;
};

export type TValidateUsernameBody = {
  code: UsernameResponseErrorCode;
};

export type TPromotionChannelsBody = {
  promotionChannelsVisibilityPrivacy: UserPrivacyLevel | undefined;
  facebook: string | undefined;
  twitter: string | undefined;
  youtube: string | undefined;
  twitch: string | undefined;
  guilded: string | undefined;
};

export type TCountry = {
  countryName: string;
  localizedName: string;
  countryId: number;
  subdivisionIso: string | undefined;
  localizedSubdivision: string | undefined;
};

export type TAccountCountryBody = {
  value: TCountry;
};

export type TEmailsBody = {
  verifiedEmail: string | null;
  pendingEmail: string | null;
};

export type TUpdateEmailBody = {
  emailAddress: string;
  password: string;
};

export type TGetEmailBody = {
  emailAddress: string;
  verified: boolean;
  canBypassPasswordForEmailUpdate: boolean;
};

export type TAccountInfoBody = {
  UserAbove13: boolean;
  IsEmailOnFile: boolean;
  IsEmailVerified: boolean;
  UseSuperSafePrivacyMode: boolean;
  HasValidPasswordSet: boolean;
  UserEmail: string;
  CanTrade: boolean;
  CanHideInventory: boolean;
  IsAccountRestrictionsFeatureEnabled: boolean;
  IsAgeDownEnabled: boolean;
  PreviousUserNames: string;
  Name: string;
  HasCurrencyOperationError: boolean;
  RobuxRemainingForUsernameChange: number;
  IsSetPasswordNotificationEnabled: boolean;
  DisplayName: string;
  IsDisplayNamesEnabled: boolean;
  MyAccountSecurityModel: {
    IsTwoStepEnabled: boolean;
  };
  UserId: number;
};

export type TUsernameChangePriceResponse = {
  priceInRobux: number;
  basePriceInRobux: number;
};

export type TUpdatePasswordBody = {
  currentPassword: string;
  newPassword: string;
  secureAuthenticationIntent: TSecureAuthIntent | null;
};

export type TAgeGroupRequest = {
  bustCache?: boolean;
};

export type TAgeGroupResponse = {
  ageGroupTranslationKey: string;
  estimatedAgeGroupTranslationKey?: string;
  estimatedAge?: string;
  isChecked: boolean;
  ageVerificationDeadline: string; // iso date string
  isPendingWithUnknownDeadline: boolean;
};

export type TForgetUserRequest = {
  userId: number;
};
