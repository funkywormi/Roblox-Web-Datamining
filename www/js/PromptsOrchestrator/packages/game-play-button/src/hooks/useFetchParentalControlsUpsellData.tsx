import { useState, useEffect } from "react";
import playButtonService from "../services/playButtonService";
import { TContentMaturityRating, TSettingResponse } from "../types/playButtonTypes";
import useAgeRecommendationDataForUniverseId from "./useAgeRecommendationDataForUniverseId";

type TParentalControlsUpsellData = {
  contentAgeRestriction: TSettingResponse | undefined;
  contentMaturityRating: TContentMaturityRating | undefined;
  isFetching: boolean;
  hasError: boolean;
};

/**
 * Fetches the experience's contentMaturityRating and the user's contentAgeRestriction setting,
 * which will be used to determine which upsell modal to display.
 */
const useFetchParentalControlsUpsellData = (universeId: string): TParentalControlsUpsellData => {
  const [contentAgeRestriction, setContentAgeRestrictionResponse] = useState<
    TSettingResponse | undefined
  >(undefined);
  const [isFetchingSettings, setIsFetchingSettings] = useState<boolean>(false);
  const [hasSettingsAndOptionsError, setHasSettingsAndOptionsError] = useState<boolean>(false);

  useEffect(() => {
    setHasSettingsAndOptionsError(false);
    setIsFetchingSettings(true);
    playButtonService
      .getUserSettingsAndOptions()
      .then(response => {
        setContentAgeRestrictionResponse(response.contentAgeRestriction);
      })
      .catch(() => {
        setHasSettingsAndOptionsError(true);
      })
      .finally(() => {
        setIsFetchingSettings(false);
      });
  }, []);

  const {
    ageRecommendationData,
    hasError: hasAgeRecommendationError,
    isLoading: isLoadingAgeRecommendation,
  } = useAgeRecommendationDataForUniverseId(universeId);

  return {
    contentAgeRestriction,
    contentMaturityRating:
      ageRecommendationData?.ageRecommendationDetails?.summary.ageRecommendation?.contentMaturity,
    isFetching: isFetchingSettings || isLoadingAgeRecommendation,
    hasError: hasSettingsAndOptionsError || hasAgeRecommendationError,
  };
};

export default useFetchParentalControlsUpsellData;
