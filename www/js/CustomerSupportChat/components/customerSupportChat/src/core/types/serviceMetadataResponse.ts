/*
 * Support Page Metadata Response
 * https://sourcegraph.rbx.com/github.rbx.com/Roblox/www/-/blob/services/website/src/ViewModels/Support/SupportMetaDataResponse.cs
 */

import { Category, SelectorDetail } from "./serviceResponse";

export enum MainCategory {
  AccountOwnership = "account_ownership",
  BillingAndPayments = "billing",
  BugReport = "bug_report",
  ChatAndAgeSettings = "chat_age_settings",
  Dmca = "dmca",
  ExploitReport = "exploit_report",
  GiftCard = "game_credit",
  Robux = "robux",
  SafetyQueueTicket = "safety_queue_ticket",
  TechnicalSupport = "technical_support",
  Moderation = "moderation",
  DevEx = "devex",
  HowTo = "how_to",
  IdeasAndSuggestions = "ideas_suggestions",
  RobloxToys = "roblox_toys",
  SocialMediaContestOrAdOpsEvent = "contest",
  DeleteMyAccount = "top_deleteacct",
  DataPrivacyRequests = "top_privacy",
  Ads = "ads",
  ExperienceGenre = "experience_genre",
  ContentMaturity = "top_content_matur",
}

export enum SubCategory {
  AccountHacked = "account_hacked",
  ForgotPassword = "forgot_pw",
  AccountPin = "acct_pin",
  TwoStepVerification = "twostepv",
  CancelMembership = "cancel_memb",
  RobuxPurchaseIssue = "robux_p_issue",
  Subscriptions = "stop_inexpsub",
  Membership = "membership",
  PurchaseDeclined = "purchase_declined",
  PurchaseUnauthorizedCharge = "purchase_uc",
  PurchaseDidNotReceive = "purchase_not_receive",
  PurchaseCreditBalanceCurrency = "purchase_credit_balance_currency",
  BugReport = "bug_report",
  ChangeChildAge = "change_child_age",
  AdjustChildSettings = "adjust_child_settings",
  UnlinkParentAccount = "stop_unlinkgrdnacct",
  DevExHowTo = "devex_how",
  DevExMyRequest = "devex_request",
  ReportPhishingSite = "report_phish",
  OwnerDmcaClaim = "owner_dmca_claim",
  OtherSiteClaim = "other_site_claim",
  ExploitReport = "exploit_report",
  GameCardRedeem = "gc_redeem",
  GameCardSpendCredit = "gc_spend_credit",
  GameCardPartialPayment = "gc_partial_payment",
  GeneralInquiries = "stop_evnt_geninq",
  SuggestionsAndFeedback = "stop_evnt_suggfeed",
  ExperienceGameIssue = "stop_evnt_expiss",
  AppealExperienceGenre = "appeal_experience_genre",
  HowToChangeLocation = "stop_gccurralign",
  HowToGeneral = "how_general",
  HowToOther = "how_other",
  SuggestionsFeature = "sugg_Feature",
  SuggestionsFeedback = "sugg_Feedback",
  AppealAccount = "stop_appeal_acct",
  AppealContent = "stop_appeal_cntnt",
  AppealForChild = "stop_appeal_child",
  AppealNonAssetContent = "appeal_non_asset_content",
  AppealForFriend = "appeal_friend",
  AppealPurchase = "appeal_purchase",
  UserWasScammed = "i_was_scammed",
  UserAbuseReport = "user_abuse_report",
  ContentAbuseReport = "content_abuse_report",
  PhysicalToy = "physical_toy",
  ToyCode = "toy_code",
  VcCatalog = "vc_catalog",
  VcInGame = "vc_in_game",
  SafetyInquiry = "safety_inquiry",
  ContestEventPrizeNotReceived = "prize_not_received",
  ContestEventQuestion = "contest_event_question",
  CannotInstall = "cannot_install",
  CannotPlay = "cannot_play",
  SpecificGameIssue = "specific_game_issue",
  RobloxCrashing = "roblox_crashing",
  DeleteMyAccount = "stop_acctdlt",
  RightToBeForgotten = "stop_priverase",
  RightOfAccess = "stop_privaccess",
  RightForgottenAndAccess = "stop_priveraseaccess",
  CookiesAndTrackers = "stop_privcookietrack",
  OtherPrivacyRequest = "stop_privother",
  Ads = "ads",
  AssetRemovalRequest = "asset_removal_request",
  ContentMaturityAppeal = "stop_appeal_explbl_lblmatur",
  ContentMaturityAppealRestore = "stop_appeal_explbl_exprestore",
  ContentMaturityRejectAppeal = "stop_appeal_explbl_lblmatur_exprestore",
}

export enum DeviceType {
  Pc = "pc",
  Mac = "mac",
  Chromebook = "chromebook",
  Iphone = "iphone",
  Ipad = "ipad",
  AndroidPhone = "android_phone",
  AndroidTablet = "android_tablet",
  AmazonDevice = "amazon_device",
  Xbox = "xbox",
  Playstation = "playstation",
  MetaQuest = "meta_quest",
}

export type SupportMetaData = {
  categories: Category[];
  deviceTypes: SelectorDetail<DeviceType>[];
  customerServiceCharacterImageUrl: string;
  submitFormUrl: string;
  usernameCheckUrl?: string | null;
  isRobloxEmployee?: boolean;
  isEmailVerificationRequired?: boolean;
};
