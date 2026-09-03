export enum AccountStandingStatus {
  AllGood = "all_good",
  Fair = "fair",
  AtRisk = "at_risk",
  Critical = "critical",
  Banned = "banned",
}

export enum InterventionType {
  Nudge = "Nudge",
  Timeout = "Timeout",
  Warn = "Warn",
  Ban = "Ban",
  Delete = "Delete",
}

export interface AccountStandingIntervention {
  type: InterventionType;
  startTime: string;
  duration?: number;
}

export interface AccountStandingFeature {
  abuseVector: string;
  labelName: string;
  iconName: string;
  intervention?: AccountStandingIntervention;
}

export interface AccountStandingStatusInfo {
  status: AccountStandingStatus;
  statusDescription: string;
}

export interface AccountStandingResponse {
  statusInfo: AccountStandingStatusInfo;
  features: AccountStandingFeature[];
  worstPlatformIntervention?: AccountStandingIntervention;
}

export interface RecommendedRule {
  ruleTitle: string;
  ruleSubtitle: string;
  ruleDescription: string;
  ruleDescriptionBullets?: string;
  importanceTitle: string;
  importanceDescription: string;
  imageName: string;
  policyKey: string;
}

/**
 * Report list types
 */
export interface Activity {
  id: string;
  title: string;
  metadata?: string;
  description?: string;
}

export interface TextItemType {
  type: "text";
  text: string;
}

export interface BulletListItemType {
  type: "bulletList";
  text?: string;
  bulletList: string[];
}

export interface LinkItemType {
  type: "link";
  text: string;
  href: string;
}

export type EducationItem = TextItemType | BulletListItemType | LinkItemType;

export interface EducationSection {
  title: string;
  items: EducationItem[];
}

export interface Details {
  title: string;
  description: string;
  activities: Activity[];
  educationSection?: EducationSection;
}

export interface Report {
  id: string;
  reportPageHeader: string;
  title: string;
  metadata: string;
  description: string;
  details: Details;
}

export interface ReportsResponse {
  inboxPageHeader: string;
  reports: Report[];
}
