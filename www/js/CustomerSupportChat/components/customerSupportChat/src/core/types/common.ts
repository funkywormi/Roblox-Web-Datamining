import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import { SupportMetaData } from "./serviceMetadataResponse";
import { SupportTicketStateKey } from "./supportTicket";
import { AgeGateDOBGroupLabel } from "./ageGate";
import {
  UserSettingsLegacy as LegacyUserSettings,
  UserSettingsV1 as V1UserSettings,
} from "./userSettings";
import { C3ChatMetadataPayload } from "./c3Chat";

type AuthenticatedUser = typeof authenticatedUser;

export type Item = {
  id: string;
  name: string;
  val: string;
  intVal: number;
};

type EnumValues<T> = T[keyof T] & (string | number);
export type SelectedItems<T> = Partial<Record<EnumValues<T>, Item | null>>;

// TODO(mhowell): Look into transitioning state below in Redux store or React Context
// TODO(mhowell): Enable these with React DOM Router
export enum SupportContextKey {
  Invalid = "invalid",
  AgeGate = "ageGate",
  AgeGateTag = "ageGateTag",
  isUnder13 = "isUnder13",
  SupportForm = "supportForm",
  Chatbot = "chatbot",
  Metadata = "metadata",
  UserSettingsLegacy = "userSettingsLegacy",
  UserSettingsV1 = "userSettingsV1",
  AuthUser = "authenticatedUser",
  ValidateUsername = "validateUsername",
  ChatConfigPayload = "chatConfigPayload",
  SubmittedSupportFormData = "submittedSupportFormData",
  IsEligibleForChat = "isEligibleForChat",
  C3ChatConfig = "c3ChatConfig",
  ConversationId = "conversationId",
  UserTouRegion = "userTouRegion",
  TopicClassification = "topicClassification",
}

export type SupportFormState = Partial<Record<SupportTicketStateKey, string>>;

export type AgeGateContext = {
  [SupportContextKey.AgeGate]: Date;
  [SupportContextKey.AgeGateTag]: AgeGateDOBGroupLabel;
  [SupportContextKey.isUnder13]: boolean;
};

export type SupportFormContext = { [SupportContextKey.SupportForm]: SupportFormState };

export type ChatbotContext = { [SupportContextKey.Chatbot]: boolean };

export type MetadataContext = { [SupportContextKey.Metadata]: SupportMetaData };

export type UserSettingsContext = {
  [SupportContextKey.UserSettingsLegacy]: LegacyUserSettings;
  [SupportContextKey.UserSettingsV1]: V1UserSettings;
};

export type AuthUserContext = { [SupportContextKey.AuthUser]: AuthenticatedUser };

export type SubmittedSupportFormContext = {
  [SupportContextKey.SubmittedSupportFormData]: SupportFormState;
};

export type ChatContext = {
  [SupportContextKey.IsEligibleForChat]: boolean;
};

export type C3ChatContext = {
  [SupportContextKey.C3ChatConfig]: C3ChatMetadataPayload;
};

export type ConversationIdContext = {
  [SupportContextKey.ConversationId]: string;
};

export type UserTouRegionContext = {
  [SupportContextKey.UserTouRegion]: string;
};

export type TopicClassificationContext = {
  [SupportContextKey.TopicClassification]: string;
};

export type SupportInquiryContextPartial = Partial<
  AgeGateContext &
    SupportFormContext &
    ChatbotContext &
    MetadataContext &
    UserSettingsContext &
    AuthUserContext &
    SubmittedSupportFormContext &
    ChatContext &
    C3ChatContext &
    ConversationIdContext &
    UserTouRegionContext &
    TopicClassificationContext
>;

export type UpdateSupportInquiryContext = (newContext: SupportInquiryContextPartial) => void;

export type SupportInquiryContext = SupportInquiryContextPartial & {
  updateSupportInquiryContext: UpdateSupportInquiryContext;
};

export enum SupportedReceivedValues {
  StandardTicket = 0,
  SierraChat = 1,
  SierraU13Email = 2,
  C3Chat = 3,
  C3U13Email = 4,
  Throttled = 5,
  Error = 6,
}

export type GenericResponse = {
  success: boolean;
  message?: string;
  ErrorCode?: string;
  supportedReceived?: SupportedReceivedValues;
  chatMetadata?: C3ChatMetadataPayload;
  conversationId?: string;
  userTouRegion?: string;
  topicClassification?: string | null;
};

export type HelpArticle = {
  id: string;
  title: string;
  url: string;
};

export type ZendeskArticleTranslation = {
  id: number;
  url: string;
  html_url: string;
  source_id: number;
  source_type: "Article" | "Section" | "Category";
  locale: string;
  title: string;
  body: string;
  outdated: boolean;
  draft: boolean;
  hidden: boolean;
  created_at: string;
  updated_at: string;
  updated_by_id: number;
  created_by_id: number;
};

export type ZendeskArticleTranslationsResponse = {
  translations: ZendeskArticleTranslation[];
  page: number;
  previous_page: string | null;
  next_page: string | null;
  per_page: number;
  page_count: number;
  count: number;
};

export const AppRoute = {
  Default: "*",
  SupportChatSierra: "/support/chat",
  SupportChatC3: "/support/c3",
};
