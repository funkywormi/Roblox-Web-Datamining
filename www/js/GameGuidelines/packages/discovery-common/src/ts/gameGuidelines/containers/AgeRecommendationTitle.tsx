import React, { useEffect, useState, useCallback } from "react";
import { withTranslations, TranslateFunction } from "@rbx/core-scripts/react";
import experienceGuidelinesService from "../services/experienceGuidelinesService";
import gameGuidelinesTranslationsConfig from "../translation.config";
import metadataConstants from "../../gameDetails/constants/metadataConstants";
import gameGuidelinesConstants from "../constants/gameGuidelinesConstants";
import { ExperienceGuidelines, AgeRecommendationDetailsResponse } from "../types";
import assetTextFilterSettingsService from "../services/assetTextFilterSettingsService";
import IgrsRatingLabel from "../components/IgrsRatingLabel";
import ContentMaturityLabel from "../components/ContentMaturityLabel";

export type AgeRecommendationTitleProps = {
  isDisplayAgeRecommendationDetails: boolean;
  translate: TranslateFunction;
};

export const AgeRecommendationTitle = ({
  isDisplayAgeRecommendationDetails,
  translate,
}: AgeRecommendationTitleProps): JSX.Element => {
  const [isBusy, setIsBusy] = useState(false);
  const [contentContainsStrongLanguage, setContentContainsStrongLanguage] = useState(false);
  const [communicationContainsStrongLanguage, setCommunicationContainsStrongLanguage] =
    useState(false);
  const [experienceGuidelines, setExperienceGuidelines] = useState<ExperienceGuidelines | null>(
    null,
  );
  const [headerDisplayName, setHeaderDisplayName] = useState<string | null>(null);

  const { universeId = "" } = metadataConstants.metadataData() || {};

  const getCommunicationStrongLanguageSettingForUniverse = useCallback(async () => {
    try {
      const atfsResponse =
        await assetTextFilterSettingsService.getAssetTextFilterSettings(universeId);
      setCommunicationContainsStrongLanguage(atfsResponse?.Profanity === true);
    } catch {
      setCommunicationContainsStrongLanguage(false);
    }
  }, [universeId]);

  const getAgeGuidelinesForUniverse = useCallback(async () => {
    setIsBusy(true);
    try {
      const egsResponse = await experienceGuidelinesService.getAgeRecommendation(universeId);
      const ageRecommendation = egsResponse.data as AgeRecommendationDetailsResponse;

      setHeaderDisplayName(ageRecommendation.headerDisplayName);
      if (ageRecommendation.ageRecommendationDetails?.summary.ageRecommendation == null) {
        setExperienceGuidelines(null);
        return;
      }
      let descriptorDisplayNames = ageRecommendation.ageRecommendationDetails.descriptorUsages
        ?.map(usage => usage.descriptor.displayName)
        .join(", ");

      /*
      Two special cases when descriptorDisplayNames is null
      1. If the ageRec is All Ages, and there are no descriptors because
         the game doesn't have any, then we should show the suitable
         for everyone text.
      2. If we get an age rec with no descriptors which is an error, we
         still show the age recommendation we have, just without any descriptors.
      */
      if (!descriptorDisplayNames) {
        if (ageRecommendation.ageRecommendationDetails.summary.ageRecommendation.minimumAge === 0) {
          descriptorDisplayNames = gameGuidelinesConstants.SuitableForAllAgesText;
        } else {
          descriptorDisplayNames = "";
        }
      }

      const newExperienceGuidelines: ExperienceGuidelines = {
        descriptorDisplayNames,
        ageRecommendationBracket:
          ageRecommendation.ageRecommendationDetails.summary.ageRecommendation
            .displayNameWithHeaderShort ??
          ageRecommendation.ageRecommendationDetails.summary.ageRecommendation.displayName,
        igrsRating: ageRecommendation.ageRecommendationDetails.summary.ageRecommendation.igrsRating,
        igrsRatingDisplayMessage:
          ageRecommendation.ageRecommendationDetails.summary.ageRecommendation
            .igrsRatingDisplayMessage,
      };

      setExperienceGuidelines(newExperienceGuidelines);
      const strongLanguageDescriptor =
        ageRecommendation.ageRecommendationDetails.descriptorUsages?.find(
          descriptor => descriptor.name === "strong-language",
        );
      setContentContainsStrongLanguage(strongLanguageDescriptor?.contains === true);
    } catch {
      setExperienceGuidelines(null);
      setContentContainsStrongLanguage(false);
      setHeaderDisplayName(null);
    } finally {
      setIsBusy(false);
    }
  }, [universeId]);

  const updateState = useCallback(async () => {
    try {
      setIsBusy(true);
      await getAgeGuidelinesForUniverse();
      await getCommunicationStrongLanguageSettingForUniverse();
    } catch {
      setExperienceGuidelines(null);
      setCommunicationContainsStrongLanguage(false);
      setHeaderDisplayName(null);
      setContentContainsStrongLanguage(false);
    } finally {
      setIsBusy(false);
    }
  }, [getAgeGuidelinesForUniverse, getCommunicationStrongLanguageSettingForUniverse]);

  // update state on page load
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    updateState();
  }, [updateState]);

  const igrsRating = experienceGuidelines?.igrsRating;

  return (
    <React.Fragment>
      {isDisplayAgeRecommendationDetails && igrsRating && (igrsRating as string) !== "" && (
        <div data-testid="igrs-rating-label-container">
          <IgrsRatingLabel
            igrsRating={igrsRating}
            igrsRatingDisplayMessage={experienceGuidelines?.igrsRatingDisplayMessage}
            translate={translate}
          />
        </div>
      )}
      <div data-testid="content-maturity-label-container">
        <ContentMaturityLabel
          isDisplayAgeRecommendationDetails={isDisplayAgeRecommendationDetails}
          experienceGuidelines={experienceGuidelines}
          isBusy={isBusy}
          headerDisplayName={headerDisplayName}
          communicationContainsStrongLanguage={communicationContainsStrongLanguage}
          contentContainsStrongLanguage={contentContainsStrongLanguage}
          hideAgeBracket={!!igrsRating} // when an IGRS rating is present, only display any content descriptors without the age bracket display name, to avoid duplication/obfuscation of content ratings
          translate={translate}
        />
      </div>
    </React.Fragment>
  );
};

export default withTranslations<{ isDisplayAgeRecommendationDetails: boolean }>(
  AgeRecommendationTitle,
  gameGuidelinesTranslationsConfig,
);
