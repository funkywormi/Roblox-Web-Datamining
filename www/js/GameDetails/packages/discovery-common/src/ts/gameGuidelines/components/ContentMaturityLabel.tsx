import React from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import Intl from "@rbx/core-scripts/intl";
import gameGuidelinesConstants from "../constants/gameGuidelinesConstants";
import { ExperienceGuidelines } from "../types";
import urlConstants from "../constants/urlConstants";

export type ContentMaturityLabelProps = {
  isDisplayAgeRecommendationDetails: boolean;
  experienceGuidelines: ExperienceGuidelines | null;
  isBusy: boolean;
  headerDisplayName: string | null;
  communicationContainsStrongLanguage: boolean;
  contentContainsStrongLanguage: boolean;
  hideAgeBracket: boolean;
  translate: TranslateFunction;
};

export const ContentMaturityLabel = ({
  isDisplayAgeRecommendationDetails,
  experienceGuidelines,
  isBusy,
  headerDisplayName,
  communicationContainsStrongLanguage,
  contentContainsStrongLanguage,
  hideAgeBracket,
  translate,
}: ContentMaturityLabelProps): JSX.Element => {
  const locale = new Intl().getRobloxLocale();

  if (!experienceGuidelines) {
    if (isDisplayAgeRecommendationDetails && !isBusy) {
      return (
        <div className="age-rating-details col-xs-12 section-content">
          <a
            className="age-rating-age-bracket text-lead text-link"
            href={urlConstants.experienceGuidelinesPolicyPageUrl(locale)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {headerDisplayName ??
              translate(gameGuidelinesConstants.ContentMaturityTextKey) ??
              gameGuidelinesConstants.ContentMaturityText}
          </a>
          <span className="age-rating-display-name text">
            {translate(gameGuidelinesConstants.AgeGuidelinesUnavailableKey) ??
              gameGuidelinesConstants.AgeGuidelinesUnavailable}
          </span>
        </div>
      );
    }
    return <React.Fragment />;
  }

  if (isDisplayAgeRecommendationDetails) {
    if (hideAgeBracket && !experienceGuidelines.descriptorDisplayNames) {
      return <React.Fragment />;
    }
    return (
      <div className="age-rating-details col-xs-12 section-content">
        {!hideAgeBracket && (
          <a
            className="age-rating-age-bracket text-lead text-link"
            href={urlConstants.experienceGuidelinesPolicyPageUrl(locale)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {experienceGuidelines.ageRecommendationBracket}
          </a>
        )}
        <span className="age-rating-display-name text">
          {experienceGuidelines.descriptorDisplayNames}
        </span>
      </div>
    );
  }

  if (communicationContainsStrongLanguage || contentContainsStrongLanguage) {
    const ageRecommendationWithWarning = translate(
      gameGuidelinesConstants.AgeGuidelinesWithWarningKey,
      {
        guideline: experienceGuidelines.ageRecommendationBracket,
      },
    );
    return (
      <a
        className="age-recommendation-title text"
        href="#game-age-recommendation-details-container"
      >
        {
          ageRecommendationWithWarning !== ""
            ? ageRecommendationWithWarning
            : experienceGuidelines.ageRecommendationBracket // default to previous behavior if translation was empty
        }
      </a>
    );
  }

  return (
    <a className="age-recommendation-title text" href="#game-age-recommendation-details-container">
      {experienceGuidelines.ageRecommendationBracket}
    </a>
  );
};

export default ContentMaturityLabel;
