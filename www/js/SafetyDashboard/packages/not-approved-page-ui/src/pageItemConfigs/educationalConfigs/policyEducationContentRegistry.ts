import { PolicyEducationContent } from "../ConfigTypes";

const SWEARING_POLICY_EDUCATION_CONTENT: PolicyEducationContent = {
  ruleTitle: "Heading.RuleExplanation.Swearing",
  ruleSubtitle: "SubHeading.RuleExplanation.Swearing",
  ruleDescription: "Description.RuleExplanation.Swearing",
  importanceTitle: "Heading.RuleImportance",
  importanceDescription: "Description.RuleImportance.Swearing",
  policyKey: "swearing",
};

const DATING_POLICY_EDUCATION_CONTENT: PolicyEducationContent = {
  ruleTitle: "Heading.RuleExplanation.Dating",
  ruleSubtitle: "SubHeading.RuleExplanation.Dating",
  ruleDescription: "Description.RuleExplanation.Dating",
  importanceTitle: "Heading.RuleImportance",
  importanceDescription: "Description.RuleImportance.Dating",
  policyKey: "dating",
};

const BULLYING_HARASSMENT_DISCRIMINATION_CONTENT: PolicyEducationContent = {
  ruleTitle: "Heading.RuleExplanation.BullyingHarassmentDiscrimination",
  ruleSubtitle: "SubHeading.RuleExplanation.BullyingHarassmentDiscrimination",
  ruleDescription: "Description.RuleExplanation.BullyingHarassmentDiscrimination",
  importanceTitle: "Heading.RuleImportance",
  importanceDescription: "Description.RuleImportance.BullyingHarassmentDiscrimination",
  policyKey: "bullying-harassment-discrimination",
};

const DIRECTING_USERS_OFF_PLATFORM_CONTENT: PolicyEducationContent = {
  ruleTitle: "Heading.RuleExplanation.DirectingUsersOffPlatform",
  ruleSubtitle: "SubHeading.RuleExplanation.DirectingUsersOffPlatform",
  ruleDescription: "Description.RuleExplanation.DirectingUsersOffPlatform",
  importanceTitle: "Heading.RuleImportance",
  importanceDescription: "Description.RuleImportance.DirectingUsersOffPlatform",
  policyKey: "directing-users-off-platform",
};

const MISUSING_ROBLOX_SYSTEMS_CONTENT: PolicyEducationContent = {
  ruleTitle: "Heading.RuleExplanation.MisusingRobloxSystems",
  ruleSubtitle: "SubHeading.RuleExplanation.MisusingRobloxSystems",
  ruleDescription: "Description.RuleExplanation.MisusingRobloxSystems",
  ruleDescriptionBullets: "Description.RuleExplanation.Bullets.MisusingRobloxSystems",
  importanceTitle: "Heading.RuleImportance",
  importanceDescription: "Description.RuleImportance.MisusingRobloxSystems",
  policyKey: "misusing-roblox-systems",
};

const PII_CONTENT: PolicyEducationContent = {
  ruleTitle: "Heading.RuleExplanation.PII",
  ruleSubtitle: "SubHeading.RuleExplanation.PII",
  ruleDescription: "Description.RuleExplanation.PII",
  ruleDescriptionBullets: "Description.RuleExplanation.Bullets.PII",
  importanceTitle: "Heading.RuleImportance",
  importanceDescription: "Description.RuleImportance.PII",
  policyKey: "pii",
};

const REAL_LIFE_EVENTS_CONTENT: PolicyEducationContent = {
  ruleTitle: "Heading.RuleExplanation.RealLifeEvents",
  ruleSubtitle: "SubHeading.RuleExplanation.RealLifeEvents",
  ruleDescription: "Description.RuleExplanation.RealLifeEvents",
  ruleDescriptionBullets: "Description.RuleExplanation.Bullets.RealLifeEvents",
  importanceTitle: "Heading.RuleImportance",
  importanceDescription: "Description.RuleImportance.RealLifeEvents",
  policyKey: "real-life-events",
};

const SPAM_CONTENT: PolicyEducationContent = {
  ruleTitle: "Heading.RuleExplanation.Spam",
  ruleSubtitle: "SubHeading.RuleExplanation.Spam",
  ruleDescription: "Description.RuleExplanation.Spam",
  importanceTitle: "Heading.RuleImportance",
  importanceDescription: "Description.RuleImportance.Spam",
  policyKey: "spam",
};

const SSH_AND_ILLEGAL_REGULATED_ACTIVITIES_CONTENT: PolicyEducationContent = {
  ruleTitle: "Heading.RuleExplanation.SSHAndIllegalRegulatedActivities",
  ruleSubtitle: "SubHeading.RuleExplanation.SSHAndIllegalRegulatedActivities",
  ruleDescription: "Description.RuleExplanation.SSHAndIllegalRegulatedActivities",
  // The bullets key is different because it's too long for Translations Hub.
  ruleDescriptionBullets: "Description.RuleExplanation.Bullets.SSHAndIllegalRegAct",
  importanceTitle: "Heading.RuleImportance",
  importanceDescription: "Description.RuleImportance.SSHAndIllegalRegulatedActivities",
  policyKey: "ssh-and-illegal-regulated-activities",
};

const VIOLENT_CONTENT_AND_GORE_CONTENT: PolicyEducationContent = {
  ruleTitle: "Heading.RuleExplanation.ViolentContentAndGore",
  ruleSubtitle: "SubHeading.RuleExplanation.ViolentContentAndGore",
  ruleDescription: "Description.RuleExplanation.ViolentContentAndGore",
  importanceTitle: "Heading.RuleImportance",
  importanceDescription: "Description.RuleImportance.ViolentContentAndGore",
  policyKey: "violent-content-and-gore",
};

/**
 * Registry mapping translation keys to policy education content. Used to determine which policy
 * education pages to show based on the translation keys.
 *
 * Maps the translation keys for each abuse type to the appropriate policy education content.
 * Source: https://sourcegraph.rbx.com/github.rbx.com/Roblox/service-contracts/-/blob/protos/roblox/trust_and_safety/trust_and_safety/v1/violation_type.proto
 */
const POLICY_EDUCATION_CONTENT_REGISTRY: Record<string, PolicyEducationContent> = {
  "Label.AbuseType.CheatandExploits": MISUSING_ROBLOX_SYSTEMS_CONTENT,
  "Label.AbuseType.ContestsandSweepstakes": SSH_AND_ILLEGAL_REGULATED_ACTIVITIES_CONTENT,
  "Label.AbuseType.Dating": DATING_POLICY_EDUCATION_CONTENT,
  "Label.AbuseType.DirectingUsersOffPlatform": DIRECTING_USERS_OFF_PLATFORM_CONTENT,
  "Label.AbuseType.DiscriminatoryContent": BULLYING_HARASSMENT_DISCRIMINATION_CONTENT,
  "Label.AbuseType.DisruptiveAudio": MISUSING_ROBLOX_SYSTEMS_CONTENT,
  "Label.AbuseType.EncouragingDangerousBehavior": SSH_AND_ILLEGAL_REGULATED_ACTIVITIES_CONTENT,
  "Label.AbuseType.ExtortionandBlackmail": BULLYING_HARASSMENT_DISCRIMINATION_CONTENT,
  "Label.AbuseType.Harassment": BULLYING_HARASSMENT_DISCRIMINATION_CONTENT,
  "Label.AbuseType.IllegalandRegulatedContent": SSH_AND_ILLEGAL_REGULATED_ACTIVITIES_CONTENT,
  "Label.AbuseType.Impersonation": BULLYING_HARASSMENT_DISCRIMINATION_CONTENT,
  "Label.AbuseType.IrlDangerousActivities": SSH_AND_ILLEGAL_REGULATED_ACTIVITIES_CONTENT,
  "Label.AbuseType.MisusingRobloxSystems": MISUSING_ROBLOX_SYSTEMS_CONTENT,
  "Label.AbuseType.OffPlatformSpeechandBehavior": BULLYING_HARASSMENT_DISCRIMINATION_CONTENT,
  "Label.AbuseType.PrivacyAskingforPII": PII_CONTENT,
  "Label.AbuseType.PrivacyGivingPII": PII_CONTENT,
  "Label.AbuseType.RealLifeThreats": BULLYING_HARASSMENT_DISCRIMINATION_CONTENT,
  "Label.AbuseType.Scamming": MISUSING_ROBLOX_SYSTEMS_CONTENT,
  "Label.AbuseType.SexualContent": DATING_POLICY_EDUCATION_CONTENT,
  "Label.AbuseType.Spam": SPAM_CONTENT,
  "Label.AbuseType.SuicideSelfHarm": SSH_AND_ILLEGAL_REGULATED_ACTIVITIES_CONTENT,
  "Label.AbuseType.Swearing": SWEARING_POLICY_EDUCATION_CONTENT,
  "Label.AbuseType.ThreatsOrAbuseOfRobloxEmployeesOrAffiliates":
    BULLYING_HARASSMENT_DISCRIMINATION_CONTENT,
  "Label.AbuseType.ViolentContentAndGore": VIOLENT_CONTENT_AND_GORE_CONTENT,
  "Label.AbuseType.VirtualCasino": SSH_AND_ILLEGAL_REGULATED_ACTIVITIES_CONTENT,
  "Label.Sublabel.RealLifeEvents": REAL_LIFE_EVENTS_CONTENT,
  "Label.Sublabel.RomanceOrSex": DATING_POLICY_EDUCATION_CONTENT,
};

export default POLICY_EDUCATION_CONTENT_REGISTRY;
