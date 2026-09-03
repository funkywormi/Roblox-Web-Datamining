import { Item } from "./common";

export enum SupportTicketStateKey {
  UsernameEmpty = "usernameEmpty",
  Username = "username",
  FirstName = "firstName",
  Email = "email",
  ConfirmEmail = "confirmEmail",
  AssetId = "assetId",
  DeviceType = "deviceType",
  HelpCategoryType = "helpCategoryType",
  HelpSubCategoryType = "helpSubCategoryType",
  UniverseId = "universeId",
  Message = "message",
  IsBlockedFromSubmitting = "isBlockedFromSubmitting",
  Captcha = "captcha",
  ServerError = "serverError",
  SubmittedSupportFormData = "submittedSupportFormData",
  TicketId = "ticketId",
  Success = "success",
  None = "none",
  OptOutCommunication = "optOutCommunication",
}

export interface CreateSupportTicketRequestModel {
  mainCategory: string;
  subCategory: string;
  deviceType: string;
  username?: string;
  message: string;
  email: string;
  name?: string;
  ageCategory: string;
  assetID?: string;
  captchaId?: string;
  captchaToken?: string;
  helpArticleCenterId?: string;
  helpArticleLang?: string;
  universeID?: string;
  otpSessionToken?: string;
  optOutCommunication?: boolean;
}

// TODO(mhowell): Refactor www backend to return error/status codes instead of messages that may be more dynamic and user facing in the future now these are limited by the downstream services we are inheriting
export enum StaticResponseMessage {
  Captcha = "Challenge is required to authorize the request",
  SubmissionCaptchaError = "CAPTCHA",
  UnknownCaptchaError = "Type: captcha;",
}

export enum FieldValidationProgress {
  None,
  Validating,
  ValidatedUsername,
  InvalidUsername,
  EmptyUsername,
}

export type SupportTicketSelector = Record<
  SupportTicketStateKey,
  { key: SupportTicketStateKey; label: string; items: Item[] }
>;

export type SupportTicketError = Partial<
  Record<
    SupportTicketStateKey,
    {
      condition?: unknown;
      message: string;
    }
  >
>;

export type SupportTicketSelectableItems = Partial<
  Pick<
    SupportTicketSelector,
    | SupportTicketStateKey.DeviceType
    | SupportTicketStateKey.HelpCategoryType
    | SupportTicketStateKey.HelpSubCategoryType
  >
>;
export type SupportTicketSelectableItemKeys = keyof SupportTicketSelectableItems;

export type SupportTicketFieldExistenceError = Partial<
  Record<
    SupportTicketStateKey,
    SupportTicketError[keyof SupportTicketError] & { condition: boolean }
  >
>;

export enum UsernameValidationResponseCode {
  ValidUsername = 0,
  AlreadyInUse = 1,
  Moderation = 2,
  InvalidLength = 3,
  StartsOrEndsWithUnderscore = 4,
  TooManyUnderscores = 5,
  ContainsSpaces = 6,
  InvalidCharacters = 7,
  ContainsPii = 10,
  ContainsReservedUsername = 12,
}

export enum UsernameValidationContext {
  Unknown = 0,
  Signup = 1,
  UsernameChange = 2,
}

export type UsernameValidationResponse = { usernames: string[] };
