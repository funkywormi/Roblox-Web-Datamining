import type { TranslateFunction } from "@rbx/core-scripts/react";
import type { RecommendedRule } from "../../types/api";

/**
 * Localized fallback rules used when the backend recommended-rules endpoint is unavailable (e.g.
 * network error, or empty response). When the endpoint returns content, `CommunityTipsSection` uses
 * that instead; this list is only resolved as a fail-open fallback.
 *
 * These reuse the `RecommendedRule` shape, but the text fields hold translation keys (from the
 * `Feature.NotApproved` namespace) rather than finished display strings, so the hardcoded fallback
 * can be localized at render time.
 *
 * The content, order, and `imageName` values intentionally mirror the backend's default educational
 * content. The array order is the order tips are always rendered in.
 */
const FALLBACK_RULES: RecommendedRule[] = [
  {
    imageName: "thumbsup",
    policyKey: "dating",
    ruleTitle: "Heading.RuleExplanation.Dating",
    ruleSubtitle: "SubHeading.RuleExplanation.Dating",
    ruleDescription: "Description.RuleExplanation.Dating",
    importanceTitle: "Heading.RuleImportance",
    importanceDescription: "Description.RuleImportance.Dating",
  },
  {
    imageName: "community",
    policyKey: "bullying-harassment-discrimination",
    ruleTitle: "Heading.RuleExplanation.BullyingHarassmentDiscrimination",
    ruleSubtitle: "SubHeading.RuleExplanation.BullyingHarassmentDiscrimination",
    ruleDescription: "Description.RuleExplanation.BullyingHarassmentDiscrimination",
    importanceTitle: "Heading.RuleImportance",
    importanceDescription: "Description.RuleImportance.BullyingHarassmentDiscrimination",
  },
  {
    imageName: "lock",
    policyKey: "pii",
    ruleTitle: "Heading.RuleExplanation.PII",
    ruleSubtitle: "SubHeading.RuleExplanation.PII",
    ruleDescription: "Description.RuleExplanation.PII",
    ruleDescriptionBullets: "Description.RuleExplanation.Bullets.PII",
    importanceTitle: "Heading.RuleImportance",
    importanceDescription: "Description.RuleImportance.PII",
  },
  {
    imageName: "trophy",
    policyKey: "misusing-roblox-systems",
    ruleTitle: "Heading.RuleExplanation.MisusingRobloxSystems",
    ruleSubtitle: "SubHeading.RuleExplanation.MisusingRobloxSystems",
    ruleDescription: "Description.RuleExplanation.MisusingRobloxSystems",
    ruleDescriptionBullets: "Description.RuleExplanation.Bullets.MisusingRobloxSystems",
    importanceTitle: "Heading.RuleImportance",
    importanceDescription: "Description.RuleImportance.MisusingRobloxSystems",
  },
  {
    imageName: "globe",
    policyKey: "real-life-events",
    ruleTitle: "Heading.RuleExplanation.RealLifeEvents",
    ruleSubtitle: "SubHeading.RuleExplanation.RealLifeEvents",
    ruleDescription: "Description.RuleExplanation.RealLifeEvents",
    ruleDescriptionBullets: "Description.RuleExplanation.Bullets.RealLifeEvents",
    importanceTitle: "Heading.RuleImportance",
    importanceDescription: "Description.RuleImportance.RealLifeEvents",
  },
  {
    imageName: "link_angle",
    policyKey: "directing-users-off-platform",
    ruleTitle: "Heading.RuleExplanation.DirectingUsersOffPlatform",
    ruleSubtitle: "SubHeading.RuleExplanation.DirectingUsersOffPlatform",
    ruleDescription: "Description.RuleExplanation.DirectingUsersOffPlatform",
    importanceTitle: "Heading.RuleImportance",
    importanceDescription: "Description.RuleImportance.DirectingUsersOffPlatform",
  },
];

/**
 * Resolves the hardcoded fallback rules into `RecommendedRule[]` so the fallback is the exact shape
 * the backend returns.
 */
export const buildFallbackRecommendedRules = (translate: TranslateFunction): RecommendedRule[] =>
  FALLBACK_RULES.map(rule => {
    const resolved: RecommendedRule = {
      imageName: rule.imageName,
      policyKey: rule.policyKey,
      ruleTitle: translate(rule.ruleTitle),
      ruleSubtitle: translate(rule.ruleSubtitle),
      ruleDescription: translate(rule.ruleDescription),
      importanceTitle: translate(rule.importanceTitle),
      importanceDescription: translate(rule.importanceDescription),
    };

    if (rule.ruleDescriptionBullets) {
      resolved.ruleDescriptionBullets = translate(rule.ruleDescriptionBullets);
    }

    return resolved;
  });
