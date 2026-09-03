import React, { useEffect, useMemo, useState } from "react";
import { withTranslations, TranslateFunction } from "@rbx/core-scripts/react";
import { useAgeRecommendationDataForUniverseId } from "@rbx/game-play-button";
import gameGuidelinesTranslationsConfig from "../translation.config";
import metadataConstants from "../../gameDetails/constants/metadataConstants";
import gameGuidelinesConstants from "../constants/gameGuidelinesConstants";
import assetTextFilterSettingsService from "../services/assetTextFilterSettingsService";
import IgrsRatingLabel from "../components/IgrsRatingLabel";
import ContentMaturityLabel from "../components/ContentMaturityLabel";
import { ExperienceGuidelines } from "../types";

export type AgeRecommendationTitleProps = {
  isDisplayAgeRecommendationDetails: boolean;
  translate: TranslateFunction;
};

export const AgeRecommendationTitle = ({
  isDisplayAgeRecommendationDetails,
  translate,
}: AgeRecommendationTitleProps): JSX.Element => {
  const [communicationContainsStrongLanguage, setCommunicationContainsStrongLanguage] =
    useState(false);
  const [isLoadingCommunicationStrongLanguage, setIsLoadingCommunicationStrongLanguage] =
    useState(false);

  const { universeId = "" } = metadataConstants.metadataData() || {};

  const { ageRecommendationData, isLoading: isLoadingAgeRecommendationData } =
    useAgeRecommendationDataForUniverseId(universeId);
  const ageRecommendationDetails = ageRecommendationData?.ageRecommendationDetails;
  const headerDisplayName = ageRecommendationData?.headerDisplayName ?? null;

  useEffect(() => {
    if (!universeId) {
      setIsLoadingCommunicationStrongLanguage(false);
      setCommunicationContainsStrongLanguage(false);
      return;
    }

    setIsLoadingCommunicationStrongLanguage(true);

    assetTextFilterSettingsService
      .getAssetTextFilterSettings(universeId)
      .then(response => {
        setCommunicationContainsStrongLanguage(response?.Profanity === true);
      })
      .catch(() => {
        setCommunicationContainsStrongLanguage(false);
      })
      .finally(() => {
        setIsLoadingCommunicationStrongLanguage(false);
      });
  }, [universeId]);

  const experienceGuidelines = useMemo<ExperienceGuidelines | null>(() => {
    const ageRecommendation = ageRecommendationDetails?.summary.ageRecommendation;
    if (!ageRecommendation) {
      return null;
    }

    let descriptorDisplayNames = ageRecommendationDetails?.descriptorUsages
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
      if (ageRecommendation.minimumAge === 0) {
        descriptorDisplayNames = gameGuidelinesConstants.SuitableForAllAgesText;
      } else {
        descriptorDisplayNames = "";
      }
    }

    return {
      descriptorDisplayNames,
      ageRecommendationBracket:
        ageRecommendation.displayNameWithHeaderShort ?? ageRecommendation.displayName,
      igrsRating: ageRecommendation.igrsRating,
      igrsRatingDisplayMessage: ageRecommendation.igrsRatingDisplayMessage,
    };
  }, [ageRecommendationDetails]);

  const contentContainsStrongLanguage = useMemo(() => {
    return (
      ageRecommendationDetails?.descriptorUsages?.find(
        descriptor => descriptor.name === "strong-language",
      )?.contains === true
    );
  }, [ageRecommendationDetails]);

  const igrsRating = experienceGuidelines?.igrsRating;
  const isBusy = isLoadingCommunicationStrongLanguage || isLoadingAgeRecommendationData;

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
