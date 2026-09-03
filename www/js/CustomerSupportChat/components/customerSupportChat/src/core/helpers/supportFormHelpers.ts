import Roblox from "@rbx/core-scripts/legacy/Roblox";
import { TranslateFunction } from "@rbx/core-scripts/legacy/react-utilities";
import { SupportFormState } from "../types/common";
import { SupportTicketStateKey, CreateSupportTicketRequestModel } from "../types/supportTicket";
import { SubCategory, SupportMetaData } from "../types/serviceMetadataResponse";
import { Category, SelectorDetail } from "../types/serviceResponse";

// Event names for telemetry
export enum EventName {
  SupportClick = "CustomerChatPortalArticleClick",
  SupportSubmitAfterReadArticle = "CustomerChatPortalSubmitAfterReadArticle",
  SupportSubmitWithoutReadArticle = "CustomerChatPortalSubmitWithoutReadArticle",
}

// The maximum length of a query parameter just to be safe
const MAX_QUERY_PARAM_LENGTH = 50;

/**
 * Help categories that require the user to provide a username on the support form.
 *
 * Tickets without a username are not eligible for chatbot flows, so for the
 * categories below we require username up front to improve automation rates.
 *
 * Values match the `mainCategory.name` returned by the support metadata API
 * (which is what the form stores in `helpCategoryType`), not the identifier.
 *
 * Categories intentionally NOT in this list (username remains optional):
 *   BillingAndPayments, DevEx, Dmca, AppealDecision (Moderation),
 *   SafetyQueueTicket (User Safety Concern), DeleteMyAccount,
 *   DataPrivacyRequests, ContentMaturity, Roblox Commerce.
 */
export const USERNAME_REQUIRED_CATEGORIES: readonly string[] = [
  "AccountOwnership", // Account Hacked or Can't Log in
  "BugReport",
  "ChatAndAgeSettings", // Age-Based Settings and Accounts with Parental Privileges
  "ExploitReport",
  "GiftCard",
  "HowTo",
  "IdeasAndSuggestions",
  "RobloxToys",
  "Robux", // Purchases Using Robux
  "SocialMediaContestOrAdOpsEvent", // Contests & Events
  "TechnicalSupport",
  "ExperienceGenre",
];

export const isUsernameRequiredForCategory = (helpCategoryType?: string): boolean => {
  if (!helpCategoryType) return false;
  return USERNAME_REQUIRED_CATEGORIES.includes(helpCategoryType);
};

const emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";

export const isValidEmail = (email: string): boolean => {
  const re = new RegExp(emailRegex);
  return re.test(email) && !email.endsWith("@roblox.com");
};

export const normalizeUsername = (username?: string): string => {
  if (!username) return "";
  // Undefined local for lowercase is most neutral to all cultures similar to DotNet's ToLowerInvariantCulture
  // Normalize NFC resolves issues with characters that have multiple valid representations in Unicode
  return username?.toLocaleLowerCase("und")?.normalize("NFC");
};

// TODO(mhowell): Translate all the error message fields below not already translated
export const getFormFieldErrors = (
  formData: SupportFormState,
  t: TranslateFunction,
): Record<string, string> => {
  const errors: Record<string, string> = {};
  const {
    email,
    confirmEmail,
    message,
    deviceType,
    helpCategoryType,
    helpSubCategoryType,
    assetId,
    universeId,
    username,
  } = formData;

  // Check required fields
  if (!email) {
    errors.email = t("Response.EmailRequired");
  }
  if (!confirmEmail) {
    errors.confirmEmail = t("Response.ConfirmEmailRequired");
  }
  if (!deviceType) {
    errors.deviceType = t("Response.DeviceTypeRequired");
  }
  if (!helpCategoryType) {
    errors.helpCategoryType = t("Response.HelpCategoryRequired");
  }
  if (!helpSubCategoryType) {
    errors.helpSubCategoryType = t("Response.HelpSubCategoryRequired");
  }
  if (!message) {
    errors.message = t("Response.DescriptionRequired");
  }
  if (!username && isUsernameRequiredForCategory(helpCategoryType)) {
    errors.username = t("Heading.Dialog.InvalidUsername");
  }

  if (email && !isValidEmail(email)) {
    errors.email = t("Response.EmailFormatError");
  }
  if (!errors.email && email !== confirmEmail) {
    errors.confirmEmail = t("Response.EmailNotMatching");
  }

  const isAssetIdValid = assetId && !Number.isNaN(Number(assetId)) && Number(assetId) > 0;
  // Only validate the asset ID if it's provided since it's an optional field.
  if (assetId && !isAssetIdValid) {
    errors.assetId = t("Response.InvalidAssetID");
  }

  const isUniverseIdValid =
    universeId && !Number.isNaN(Number(universeId)) && Number(universeId) > 0;
  if (helpSubCategoryType === "AppealExperienceGenre" && !isUniverseIdValid) {
    errors.universeId = t("Response.InvalidUniverseID");
  }

  return errors;
};

export const toSupportTicketRequestModel = (
  state: SupportFormState,
  captchaId: string | null | undefined,
  captchaToken: string | null | undefined,
  helpCenterArticleId: string | null | undefined,
  helpCenterArticleLang: string | null | undefined,
  ageCategory: string,
  otpSessionToken?: string | null,
): CreateSupportTicketRequestModel => ({
  username: normalizeUsername(state[SupportTicketStateKey.Username]),
  message: state[SupportTicketStateKey.Message] ?? "",
  email: state[SupportTicketStateKey.Email] ?? "",
  mainCategory: state[SupportTicketStateKey.HelpCategoryType] ?? "",
  subCategory: state[SupportTicketStateKey.HelpSubCategoryType] ?? "",
  deviceType: state[SupportTicketStateKey.DeviceType] ?? "",
  ageCategory,
  name: state[SupportTicketStateKey.FirstName] || "Guest",
  ...(state[SupportTicketStateKey.AssetId] && { assetId: state[SupportTicketStateKey.AssetId] }),
  ...(state[SupportTicketStateKey.UniverseId] && {
    universeId: state[SupportTicketStateKey.UniverseId],
  }),
  ...(captchaId && { captchaId }),
  ...(captchaToken && { captchaToken }),
  ...(helpCenterArticleId && { helpCenterArticleId }),
  ...(helpCenterArticleLang && { helpCenterArticleLang }),
  ...(otpSessionToken && { otpSessionToken }),
  ...(state[SupportTicketStateKey.HelpCategoryType] === "AppealDecision" && {
    optOutCommunication: state[SupportTicketStateKey.OptOutCommunication] === "true",
  }),
});

export const getCatFromId = (
  metadata?: SupportMetaData,
  categoryId?: string,
): Category | undefined => {
  if (!categoryId || !metadata) return undefined;
  return metadata.categories.find(cat => cat.mainCategory.identifier === categoryId);
};

export const getSubCatNameFromId = (
  subcategoryId?: string,
  category?: Category,
): SelectorDetail<SubCategory> | undefined => {
  if (!category || !subcategoryId) return undefined;
  return category.subCategories.find(subCat => subCat.identifier === subcategoryId);
};

/**
 *
 * @param queryParams - URLSearchParams object
 * @param name - name of the query param to get
 * @returns the value of the query param if it exists and is less than or equal to MAX_QUERY_PARAM_LENGTH characters, otherwise null
 */
export const getAndValidateQueryParam = (
  queryParams: URLSearchParams,
  name: string,
): string | null => {
  const value = queryParams.get(name);
  return value && value.length <= MAX_QUERY_PARAM_LENGTH ? value : null;
};

/**
 * Helper to fire a telemetry event using the Roblox EventStream system
 */
export const dispatchTelemetryEvent = (
  eventName: EventName,
  context: string,
  additionalProperties: Record<string, unknown>,
): void => {
  if (!Roblox.EventStream) return;
  Roblox.EventStream.SendEventWithTarget(
    eventName,
    context,
    {
      meta: JSON.stringify({ ...additionalProperties, source: "support-form" }),
    },
    Roblox.EventStream.TargetTypes.WWW,
  );
};
