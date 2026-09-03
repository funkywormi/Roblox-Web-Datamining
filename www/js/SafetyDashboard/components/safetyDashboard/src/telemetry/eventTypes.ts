/**
 * Every Safety Dashboard event lands in the single `trustsafety_safety_dashboard_event`
 * table under the one event name `safetyDashboardEvent`, discriminated by `eventType`.
 * Keep these values short camelCase strings; they are written verbatim to the `eventType`
 * column.
 */
export enum SafetyDashboardEventType {
  AccountRestrictionOpen = "accountRestrictionOpen",
  AccountStandingError = "accountStandingError",
  AccountTimeoutPress = "accountTimeoutPress",
  FeatureTimeoutPress = "featureTimeoutPress",
  IxpError = "ixpError",
  PageView = "pageView",
  ShowAllTimeouts = "showAllTimeouts",
  StatusExplainerOpen = "statusExplainerOpen",
  TipPress = "tipPress",
  ViolationRowNav = "violationRowNav",
}

/**
 * Violations and Appeals portal events that land in the `trustsafety_appeals_portal_event`
 * table.
 */
export enum AppealsEventType {
  ApiError = "appealsPortalApiError",
  AppealEligibility = "appealsPortalAppealEligibility",
  Error = "appealsPortalError",
  MissingTranslation = "appealsPortalMissingTranslation",
  PageLoad = "appealsPortalPageLoad",
  RequestAppeal = "appealsPortalRequestAppeal",
  StartAppeal = "appealsPortalStartAppeal",
  SupportClick = "appealsPortalSupportClick",
  UnknownViolation = "appealsPortalUnknownViolation",
  ValidationError = "appealsPortalValidationError",
}
