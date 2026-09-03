export enum EventTypes {
  AccountReactivationPageRendered = "accountReactivationPageRendered",
  PageRendered = "pageRendered",
  UnmappedViolationKey = "unmappedViolationKey",
  CheckboxChecked = "checkboxChecked",
  LogoutClicked = "logoutClicked",
  ReactivateClicked = "reactivateClicked",
  ParentVerificationClicked = "parentVerificationClicked",
  EmailVerificationClicked = "emailVerificationClicked",
  TermsOfUseClicked = "termsOfUseClicked",
  AppealsProcessClicked = "appealsProcessClicked",
  CommunityGuidelineClicked = "communityGuidelineClicked",
  UGCGuidelinesClicked = "ugcGuidelinesClicked",
  AppealsPortalClicked = "appealsPortalClicked",
  ContinueClicked = "continueClicked",
  BackClicked = "backClicked",
  SecondChanceReactivateClicked = "secondChanceReactivateClicked",
  MissingTranslation = "missingTranslation",
  Error = "error",
  // Used specifically on Creator Hub to track redirects for unsupported NAP use cases
  VerificationRedirectRendered = "verificationRedirectRendered",
  AccountReactivationRedirectRendered = "accountReactivationRedirectRendered",
}

export enum EventContext {
  NotApprovedPage = "NotApprovedPageV2",
}

export const EVENT_NAME = "NotApprovedPageEvent";

export type NotApprovedPageEventProperties = {
  eventType: EventTypes;
  timestamp: number;
  platform: string;
  interventionId?: string;
  punishedUserId?: number;
  isReactivationEligible?: boolean;
  verificationCategory?: string;
  unmappedViolationKey?: string;
  pageName?: string;
  timeOnPageMs?: number;
  additionalInfo?: string;
};

/**
 * Wire-shaped analytics event emitted by the not-approved-page surface. The
 * package is the sole source of truth for `eventName` and `context`; both are
 * literal-typed so consumers cannot substitute alternate values. Consumers
 * forward the event to their host pipeline (typically by mapping this shape
 * onto the host's tracker envelope).
 */
export type NotApprovedAnalyticsEvent = {
  eventName: typeof EVENT_NAME;
  context: EventContext.NotApprovedPage;
  properties: NotApprovedPageEventProperties;
};

/**
 * Forwards a fully-assembled analytics event to the host's event pipeline. The
 * package assembles the entire payload (including wire-level `eventName` and
 * `context`); hosts are responsible only for mapping it onto their transport
 * and attaching any ambient context (user id, session id, etc.) that this
 * package does not provide directly.
 */
export type SendAnalyticsEvent = (event: NotApprovedAnalyticsEvent) => void;
