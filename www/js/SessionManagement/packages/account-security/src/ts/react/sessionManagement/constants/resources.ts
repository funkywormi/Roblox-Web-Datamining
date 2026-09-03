import { Intl } from "Roblox";
import {
  TokenMetadataAgent,
  TokenMetadataAgentType,
  TokenMetadataLocation,
} from "../../../common/request/types/sessionManagement";
import { SESSION_MANAGEMENT_LANGUAGE_RESOURCES } from "../app.config";

/**
 * A type adapted from the base type of `translate`, which we use to limit the
 * keys that can be translated.
 */
type TranslateFunction = (
  resourceId: (typeof SESSION_MANAGEMENT_LANGUAGE_RESOURCES)[number],
  parameters?: Record<string, unknown>,
) => string;

// IMPORTANT: Add resource keys to `app.config.ts` as well.
export const getResources = (translate: TranslateFunction) =>
  ({
    Action: {
      Cancel: translate("Action.Cancel"),
      LogOut: translate("Action.LogOut"),
      LogOutAllSessions: translate("Action.LogOutAllSessions"),
      LogOutOfSession: translate("Action.LogOutOfSession"),
      LogOutOfUnknownSessions: translate("Action.LogOutOfUnknownSessions"),
      PleaseTryAgain: translate("Action.PleaseTryAgain"),
      ShowMore: translate("Action.ShowMore"),
    },
    Description: {
      ConfidenceTrusted:
        translate("Description.ConfidenceTrusted") ||
        "When we have higher confidence that you’re the user, we trust that device.",
      ConsoleLogoutDisclaimer: translate("Description.ConsoleLogoutDisclaimer"),
      CurrentlyLoggedIn: translate("Description.CurrentlyLoggedIn"),
      OldSessionsWithUnknownData: translate("Description.OldSessionsWithUnknownData"),
      YouWillBeLoggedOut: translate("Description.YouWillBeLoggedOut"),
      YouWillBeLoggedOutAllSessions: translate("Description.YouWillBeLoggedOutAllSessions"),
    },
    Header: {
      LogOutAllSessions: translate("Header.LogOutAllSessions"),
      LogOutOfSession: translate("Header.LogOutOfSession"),
      UnknownInfo: translate("Header.UnknownInfo"),
      WhereYoureLoggedIn: translate("Header.WhereYoureLoggedIn"),
      ThisDevice: translate("Header.ThisDevice") || "This device",
      YourSession: translate("Header.YourSession"),
      DevicesWhereYouAreLoggedIn:
        translate("Header.DevicesWhereYouAreLoggedIn") || "Devices where you're logged in",
    },
    Label: {
      ApproximateLocationAndTimestamp: translate("Label.ApproximateLocationAndTimestamp"),
      DeviceDetails: translate("Label.DeviceDetails"),
      LastActive: translate("Label.LastActive"),
      Location: translate("Label.Location"),
      TooltipTitle: translate("Label.TooltipTitle") || "Time & Location Are Approximate",
      Value: {
        Browser: translate("Label.Value.Browser"),
        BrowserWithOSandBrowserInfo: (Browser: string, OS: string) =>
          translate("Label.Value.BrowserWithOSandBrowserInfo", { Browser, OS }),
        BrowserWithOSInfo: (OS: string) => translate("Label.Value.BrowserWithOSInfo", { OS }),
        JustNow: translate("Label.Value.JustNow") || "Just Now",
        Location: (city: string, subdivision: string, country: string) =>
          translate("Label.Value.Location", { city, subdivision, country }),
        LocationMissingOne: (cityOrSubdivision: string, subdivisionOrCountry: string) =>
          translate("Label.Value.LocationMissingOne", { cityOrSubdivision, subdivisionOrCountry }),
        LocationMissingTwo: (cityOrSubdivisionOrCountry: string) =>
          translate("Label.Value.LocationMissingTwo", { cityOrSubdivisionOrCountry }),
        RobloxApp: (OS: string) => translate("Label.Value.RobloxApp", { OS }),
        RobloxAppOSUnknown: translate("Label.Value.RobloxAppOSUnknown"),
        Studio: translate("Label.Value.Studio"),
        StudioWithOS: (OS: string) => translate("Label.Value.StudioWithOS", { OS }),
        ThisSession: translate("Label.Value.ThisSession"),
        UnknownDevice: translate("Label.Value.UnknownDevice"),
        UnknownLocation: translate("Label.Value.UnknownLocation"),
        UnknownTime: translate("Label.Value.UnknownTime"),
        Trusted: translate("Label.Value.Trusted") || "Trusted",
        NoActiveDelays: translate("Label.Value.NoActiveDelays") || "No active delays",
        ActiveDelayCount: (count: number) =>
          translate("Label.Value.ActiveDelayCount", { count }) ||
          `${count} active delay${count === 1 ? "" : "s"}`,
        UnknownWithCount: (Count: number) => translate("Label.Value.UnknownWithCount", { Count }),
      },
      SecurityDelays: translate("Label.SecurityDelays") || "SECURITY DELAYS",
      Delay: {
        Subject: {
          ExperienceOwnershipTransfer:
            translate("Label.Delay.Subject.Experience.OwnershipTransfer") ||
            "Experience Ownership Transfer",
          GroupPayouts: translate("Label.Delay.Subject.Group.Payouts") || "Group Payouts",
          GroupOwnershipTransfer:
            translate("Label.Delay.Subject.Group.OwnershipTransfer") || "Group Ownership Transfer",
          GroupRolesOrPermissions:
            translate("Label.Delay.Subject.Group.RolesOrPermissions") ||
            "Group Roles / Permissions",
          ForgetUser: translate("Label.Delay.Subject.ForgetUser") || "Account Deletion",
          Unknown: translate("Label.Delay.Subject.Unknown") || "Unknown",
        },
        Status: {
          Completed: translate("Label.Delay.Status.Completed") || "Completed",
          CompletedLower: translate("Label.Delay.Status.CompletedLower") || "completed",
          // There is no pending uppercase because the chip that it would be used in uses
          // the full clock value instead of an alias.
          PendingLower: translate("Label.Delay.Status.PendingLower") || "pending",
          Abandoned: translate("Label.Delay.Status.Abandoned") || "Abandoned",
          AbandonedLower: translate("Label.Delay.Status.AbandonedLower") || "abandoned",
          TimeLeft: (timeLeft: string) =>
            translate("Label.Delay.Status.TimeLeft", { timeLeft }) || `${timeLeft} left`,
          DaysLeft: (days: number) =>
            translate("Label.Delay.Status.DaysLeft", { days }) || `${days} days left`,
        },
        StartedAt: (date: string, time: string) =>
          translate("Label.Delay.StartedAt", { date, time }) || `Started ${date} at ${time}`,
        UnknownTime: translate("Label.Delay.UnknownTime") || "Unknown",
      },
      DelayLowercase: translate("Label.DelayLowercase") || "delay(s)",
    },
    Message: {
      Error: {
        Default: translate("Message.Error.Default"),
      },
    },
  }) as const;

export const getDeviceDetails = (
  resources: SessionManagementResources,
  userAgent: TokenMetadataAgent | null,
): string => {
  if (userAgent === null) {
    return resources.Label.Value.UnknownDevice;
  }
  switch (userAgent.type) {
    case TokenMetadataAgentType.UNKNOWN:
      // Special case where the Xbox classic app has agent type unknown. This
      // isn't an issue with Xbox Universal App or PlayStation.
      if (userAgent.os !== null) {
        return resources.Label.Value.RobloxApp(userAgent.os);
      }
      return resources.Label.Value.UnknownDevice;
    case TokenMetadataAgentType.APP:
      if (userAgent.os === null) {
        return resources.Label.Value.RobloxAppOSUnknown;
      }
      return resources.Label.Value.RobloxApp(userAgent.os);
    case TokenMetadataAgentType.BROWSER:
      if (userAgent.value == null || userAgent.os == null) {
        if (userAgent.os !== null) {
          return resources.Label.Value.BrowserWithOSInfo(userAgent.os);
        }
        if (userAgent.value !== null) {
          return userAgent.value;
        }
        return resources.Label.Value.Browser;
      }
      return resources.Label.Value.BrowserWithOSandBrowserInfo(userAgent.value, userAgent.os);
    case TokenMetadataAgentType.STUDIO:
      if (userAgent.os === null) {
        return resources.Label.Value.Studio;
      }
      return resources.Label.Value.StudioWithOS(userAgent.os);
    default:
      return resources.Label.Value.UnknownDevice;
  }
};

export const getLocalizedDateTime = (
  resources: SessionManagementResources,
  timestamp: string | null,
): string => {
  if (timestamp === null) {
    return resources.Label.Value.UnknownTime;
  }
  const locale = new Intl().getRobloxLocale().replace("_", "-");
  const date = new Date(Number(timestamp)).toLocaleString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
  return date;
};

export const getLocation = (
  resources: SessionManagementResources,
  location: TokenMetadataLocation | null,
): string => {
  if (location === null) {
    return resources.Label.Value.UnknownLocation;
  }
  if (location.city != null && location.subdivision != null && location.country != null) {
    return resources.Label.Value.Location(location.city, location.subdivision, location.country);
  }
  if (location.city != null && location.subdivision != null) {
    return resources.Label.Value.LocationMissingOne(location.city, location.subdivision);
  }
  if (location.city != null && location.country != null) {
    return resources.Label.Value.LocationMissingOne(location.city, location.country);
  }
  if (location.city != null) {
    return resources.Label.Value.LocationMissingTwo(location.city);
  }
  if (location.subdivision != null && location.country != null) {
    return resources.Label.Value.LocationMissingOne(location.subdivision, location.country);
  }
  if (location.subdivision != null) {
    return resources.Label.Value.LocationMissingTwo(location.subdivision);
  }
  if (location.country != null) {
    return resources.Label.Value.LocationMissingTwo(location.country);
  }
  return resources.Label.Value.UnknownLocation;
};

export type SessionManagementResources = ReturnType<typeof getResources>;
