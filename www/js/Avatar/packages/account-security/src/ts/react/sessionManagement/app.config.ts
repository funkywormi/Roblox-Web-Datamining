import { TranslationConfig } from "react-utilities";

export const FEATURE_NAME = "SessionManagement" as const;
export const LOG_PREFIX = "Session Management:" as const;

// The default number of sessions to display before the user has to click `Show More`.
export const DEFAULT_NUM_SESSIONS_TO_DISPLAY = 10 as const;

// The default number of sessions to retrieve from each call to token metadata
// service. This should be greater than or equal to `DEFAULT_NUM_SESSIONS_TO_DISPLAY`.
export const DEFAULT_DESIRED_LIMIT = 25 as const;

/**
 * Constants for event stream events.
 */
export const EVENT_CONSTANTS = {
  eventName: "sessionManagementEvent",
  context: {
    signedOutOfAllSessions: "signedOutOfAllSessions",
    signedOutOfSession: "signedOutOfSession",
    openedSessionDetails: "openedSessionDetails",
  },
} as const;

/**
 * Translations required by this web app (remember to also edit
 * `bundle.config.js` if changing this configuration).
 */
export const TRANSLATION_CONFIG: TranslationConfig = {
  common: [],
  feature: "Feature.SessionManagement",
};

/**
 * Language resource keys for Session Management.
 */
export const SESSION_MANAGEMENT_LANGUAGE_RESOURCES = [
  "Action.Cancel",
  "Action.LogOut",
  "Action.LogOutAllSessions",
  "Action.LogOutOfSession",
  "Action.LogOutOfUnknownSessions",
  "Action.PleaseTryAgain",
  "Action.ShowMore",
  "Description.ConfidenceTrusted",
  "Description.ConsoleLogoutDisclaimer",
  "Description.CurrentlyLoggedIn",
  "Description.OldSessionsWithUnknownData",
  "Description.YouWillBeLoggedOut",
  "Description.YouWillBeLoggedOutAllSessions",
  "Header.LogOutAllSessions",
  "Header.LogOutOfSession",
  "Header.UnknownInfo",
  "Header.WhereYoureLoggedIn",
  "Header.ThisDevice",
  "Header.YourSession",
  "Header.DevicesWhereYouAreLoggedIn",
  "Label.ApproximateLocationAndTimestamp",
  "Label.DelayLowercase",
  "Label.DeviceDetails",
  "Label.LastActive",
  "Label.Location",
  "Label.TooltipTitle",
  "Label.Value.Browser",
  "Label.Value.BrowserWithOSandBrowserInfo",
  "Label.Value.BrowserWithOSInfo",
  "Label.Value.JustNow",
  "Label.Value.Location",
  "Label.Value.LocationMissingOne",
  "Label.Value.LocationMissingTwo",
  "Label.Value.RobloxApp",
  "Label.Value.RobloxAppOSUnknown",
  "Label.Value.Studio",
  "Label.Value.StudioWithOS",
  "Label.Value.ThisSession",
  "Label.Value.UnknownDevice",
  "Label.Value.UnknownLocation",
  "Label.Value.UnknownTime",
  "Label.Value.UnknownWithCount",
  "Label.Value.Trusted",
  "Label.SecurityDelays",
  "Label.Value.NoActiveDelays",
  "Label.Value.ActiveDelayCount",
  "Label.Delay.Subject.Experience.OwnershipTransfer",
  "Label.Delay.Subject.Group.Payouts",
  "Label.Delay.Subject.Group.OwnershipTransfer",
  "Label.Delay.Subject.Group.RolesOrPermissions",
  "Label.Delay.Subject.ForgetUser",
  "Label.Delay.Subject.Unknown",
  "Label.Delay.Status.Completed",
  "Label.Delay.Status.CompletedLower",
  "Label.Delay.Status.PendingLower",
  "Label.Delay.Status.Abandoned",
  "Label.Delay.Status.AbandonedLower",
  "Label.Delay.Status.TimeLeft",
  "Label.Delay.Status.DaysLeft",
  "Label.Delay.StartedAt",
  "Label.Delay.UnknownTime",
  "Message.Error.Default",
] as const;
