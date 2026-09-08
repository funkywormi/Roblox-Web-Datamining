import { AcbAgeRating } from "@rbx/user-settings";

export type TAgeRatingCopy = {
  /**
   * Category label as issued by the rating authority. Never localized.
   */
  label: string;
  /**
   * Official category description. Never localized.
   */
  description: string;
};

/**
 * Copy from "IARC Rating Systems - Category Labels and Descriptions V4", which is the
 * source of truth reviewed by legal and product:
 * https://docs.google.com/document/d/1mCFwE84gLGt2dhRHjSSaXsvyblqTRzz9JmLkw32OVJ0/edit
 */
export const acbAgeRatingCopy: Record<AcbAgeRating, TAgeRatingCopy> = {
  [AcbAgeRating.G]: {
    label: "General (G)",
    description:
      "The content is very mild in impact. The G classification is suitable for a general audience.",
  },
  [AcbAgeRating.PG]: {
    label: "Parental Guidance (PG)",
    description:
      "The content is mild in impact. Computer games classified PG are not recommended for viewing or playing by persons under 15 without guidance from parents or guardians.",
  },
  [AcbAgeRating.M]: {
    label: "Mature (M)",
    description:
      "The content is moderate in impact. Recommended for mature audiences aged 15 years and over. There are no legal restrictions on access.",
  },
  [AcbAgeRating.MA15]: {
    label: "Mature Accompanied (MA 15+)",
    description:
      "The content is strong in impact. Legally restricted to people aged 15 years and over. Children under 15 may not legally access unless accompanied by a parent or adult guardian.",
  },
  [AcbAgeRating.R18]: {
    label: "Restricted (R 18+)",
    description: "The content is high in impact. Legally restricted to adults (18 years and over).",
  },
};

export default acbAgeRatingCopy;
