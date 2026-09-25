import type { PolicyEducationContent } from "../ConfigTypes";

export interface KidsContent {
  displayLabel: string;
  moderatorNote: string;
  education: PolicyEducationContent;
}

const BULLYING_CONTENT: KidsContent = {
  displayLabel: "Label.AbuseType.Bullying.Kids",
  moderatorNote: "Label.AbuseType.Bullying.Note.Kids",
  education: {
    ruleTitle: "Heading.RuleExplanation.Bullying.Kids",
    ruleDescriptionBullets: "Description.RuleExplanation.Bullets.Bullying.Kids",
    importanceTitle: "Heading.RuleImportance.Kids",
    importanceDescription: "Description.RuleImportance.Bullying.Kids",
    policyKey: "kids-bullying",
    deduplicationKey: "bullying-harassment-discrimination",
  },
};

const SEXUAL_CONTENT: KidsContent = {
  displayLabel: "Label.AbuseType.SexualContent.Kids",
  moderatorNote: "Label.AbuseType.SexualContent.Note.Kids",
  education: {
    ruleTitle: "Heading.RuleExplanation.SexualContent.Kids",
    ruleDescriptionBullets: "Description.RuleExplanation.Bullets.SexualContent.Kids",
    importanceTitle: "Heading.RuleImportance.Kids",
    importanceDescription: "Description.RuleImportance.SexualContent.Kids",
    policyKey: "kids-sexual-content",
    deduplicationKey: "dating",
  },
};

const SHARING_PII_CONTENT: KidsContent = {
  displayLabel: "Label.AbuseType.SharingPII.Kids",
  moderatorNote: "Label.AbuseType.SharingPII.Note.Kids",
  education: {
    ruleTitle: "Heading.RuleExplanation.SharingPII.Kids",
    ruleDescription: "Description.RuleExplanation.SharingPII.Kids",
    ruleDescriptionBullets: "Description.RuleExplanation.Bullets.SharingPII.Kids",
    importanceTitle: "Heading.RuleImportance.Kids",
    importanceDescriptionBullets: "Description.RuleImportance.Bullets.SharingPII.Kids",
    policyKey: "kids-sharing-pii",
    deduplicationKey: "pii",
  },
};

const KIDS_CONTENT_BY_ABUSE_KEY: Readonly<Record<string, KidsContent>> = {
  "Label.AbuseType.Harassment": BULLYING_CONTENT,
  "Label.AbuseType.PrivacyAskingforPII": SHARING_PII_CONTENT,
  "Label.AbuseType.PrivacyGivingPII": SHARING_PII_CONTENT,
  "Label.AbuseType.SexualContent": SEXUAL_CONTENT,
};

export default KIDS_CONTENT_BY_ABUSE_KEY;
