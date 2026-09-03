import { useEffect, useState } from 'react';
import CatalogAPIService from '../services/catalogAPIService';

function useMetadata() {
  const [isMetadataInitialized, setIsMetadataInitialized] = useState<boolean>(false);
  const [
    isPremiumPriceOnItemTilesEnabled,
    setIsPremiumPriceOnItemTilesEnabled
  ] = useState<boolean>();
  const [isPremiumIconOnItemTilesEnabled, setIsPremiumIconOnItemTilesEnabled] = useState<boolean>();
  const [
    autocompleteAvatarSearchNumToDisplay,
    setAutocompleteAvatarSearchNumToDisplay
  ] = useState<number>();
  const [
    isCatalogAdsRowOnRecommendedPageEnabled,
    setIsCatalogAdsRowOnRecommendedPageEnabled
  ] = useState<boolean>();
  const [isRemoveAllSubcategoryEnabled, setIsRemoveAllSubcategoryEnabled] = useState<boolean>();

  const getMetadataFromApi = () => {
    CatalogAPIService.getMetadataFromApi().then(
      function success(result) {
        setIsPremiumPriceOnItemTilesEnabled(!!result.data.isPremiumPriceOnItemTilesEnabled);
        setIsPremiumIconOnItemTilesEnabled(!!result.data.isPremiumIconOnItemTilesEnabled);
        setAutocompleteAvatarSearchNumToDisplay(result.data.autocompleteAvatarSearchNumToDisplay);
        setIsCatalogAdsRowOnRecommendedPageEnabled(
          result.data.isCatalogAdsRowOnRecommendedPageEnabled
        );
        setIsRemoveAllSubcategoryEnabled(!!result.data.isRemoveAllSubcategoryEnabled);

        setIsMetadataInitialized(true);
      },
      function error() {
        setIsMetadataInitialized(true);
      }
    );
  };

  useEffect(() => {
    getMetadataFromApi();
  }, []);

  return {
    isMetadataInitialized,
    isPremiumIconOnItemTilesEnabled,
    isPremiumPriceOnItemTilesEnabled,
    autocompleteAvatarSearchNumToDisplay,
    isCatalogAdsRowOnRecommendedPageEnabled,
    isRemoveAllSubcategoryEnabled
  };
}

export default useMetadata;
