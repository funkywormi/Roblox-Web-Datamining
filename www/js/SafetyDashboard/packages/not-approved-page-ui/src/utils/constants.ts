export enum PUNISHMENT_TYPE {
  Warn = "Warn",
  Delete = "Delete",
  Hour1 = "Ban 1 Hour",
  Hour6 = "Ban 6 Hours",
  Day1 = "Ban 1 Day",
  Day3 = "Ban 3 Days",
  Day7 = "Ban 7 Days",
  Day14 = "Ban 14 Days",
  Day30 = "Ban 30 Days",
  Day60 = "Ban 60 Days",
  Month6 = "Ban 6 Months",
  Year1 = "Ban 1 Year",
}

export const PUNISHMENT_TYPE_TO_STRING_KEY: Record<string, string> = {
  "Ban 1 Hour": "Heading.SuspendedOneHour",
  "Ban 6 Hours": "Heading.SuspendedSixHours",
  "Ban 1 Day": "Heading.SuspendedOneDay",
  "Ban 3 Days": "Heading.SuspendedThreeDays",
  "Ban 7 Days": "Heading.SuspendedSevenDays",
  "Ban 14 Days": "Heading.Suspended14Days",
  "Ban 30 Days": "Heading.SuspendedThirtyDays",
  "Ban 60 Days": "Heading.SuspendedSixtyDays",
  "Ban 6 Months": "Heading.SuspendedSixMonths",
  "Ban 1 Year": "Heading.Suspended1Year",
  Warn: "Heading.Warning",
  Delete: "Heading.Banned",
};

export const VIOLATION_TYPE_TO_PLURAL_MAP: Record<string, string> = {
  "Label.Type.Avatar": "Label.TypePlural.Avatar",
  "Label.Type.Audio": "Label.TypePlural.Audio",
  "Label.Type.AvatarAccessory": "Label.TypePlural.AvatarAccessory",
  "Label.Type.Bundle": "Label.TypePlural.Bundle",
  "Label.Type.Chat": "Label.TypePlural.Chat",
  "Label.Type.CommerceProduct": "Label.TypePlural.CommerceProduct",
  "Label.Type.Experience": "Label.TypePlural.Experience",
  "Label.Type.Game": "Label.TypePlural.Game", // same as experience violation, but updating external terminology.
  "Label.Type.Image": "Label.TypePlural.Image",
  "Label.Type.Look": "Label.TypePlural.Look",
  "Label.Type.Mesh": "Label.TypePlural.Mesh",
  "Label.Type.Model": "Label.TypePlural.Model",
  "Label.Type.Plugin": "Label.TypePlural.Plugin",
  "Label.Type.Video": "Label.TypePlural.Video",
  "Label.Type.Voice": "Label.TypePlural.Voice",
};

export const appealsProcessUrl =
  "https://en.help.roblox.com/hc/en-us/articles/360000245263-Appeal-Your-Content-Moderation";

export const REACTIVATION_CACHE_UPDATE_WAIT = 2000;

export const PUNISHMENT_DATA_ATTRIBUTE_NAME = "data-not-approved";

export const COMMUNITY_STANDARDS_URL =
  "https://en.help.roblox.com/hc/en-us/articles/203313410-Roblox-Community-Standards";

export const UGC_GUIDELINES_URL =
  "https://create.roblox.com/docs/marketplace/marketplace-policy#general-creation-guidelines";

export const ACCESS_MANAGEMENT_UPSELL_CAN_LIFT_PUNISHMENT_FEATURE_NAME =
  "CanRequestPunishmentLifting";

export const VERIFICATION_CATEGORIES = {
  Email: "Email",
  VPC: "VPC",
  None: "",
};

export enum COMMUTATION_CATEGORIES {
  Educational = "EDUCATIONAL_PASS",
}
