import { ComponentType } from "react";
import { TPunishment, CommutationEligibility } from "../utils/types";

export enum StaticPageName {
  Intro = "intro",
  Resolution = "resolution",
  Unknown = "unknown",
  SecondChanceIntro = "second-chance-intro",
  SecondChanceConclusion = "second-chance-conclusion",
}

export type PageName = StaticPageName | `policy-rule-${string}` | `policy-importance-${string}`;

export type PageItemRenderingProps = {
  punishmentData: TPunishment;
};

export type PageItemRenderingComponentType = (props: PageItemRenderingProps) => JSX.Element;

export type NAPageItemConfigType = {
  getIsVisible: (
    punishmentData: TPunishment,
    pageName?: PageName,
    commutationEligibility?: CommutationEligibility,
  ) => boolean;
  renderComponent: PageItemRenderingComponentType;
  configName: string;
};

export type CtaComponentProps = {
  punishmentData: TPunishment;
  setIsDialogOpen: (isOpen: boolean) => void;
  isDisabled?: boolean;
};

export type PageConfigType = {
  /** Human readable page name for analytics tracking */
  pageName: PageName;
  pageItems: NAPageItemConfigType[];
  CtaComponent: ComponentType<CtaComponentProps>;
};

export type PolicyEducationContent = {
  ruleTitle: string;
  ruleSubtitle?: string;
  ruleDescription: string;
  ruleDescriptionBullets?: string;
  importanceTitle: string;
  importanceDescription: string;
  policyKey: string;
};
