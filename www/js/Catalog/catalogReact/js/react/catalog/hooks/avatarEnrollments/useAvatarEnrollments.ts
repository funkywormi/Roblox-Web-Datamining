import { useCallback, useState } from 'react';
import { CurrentUser, EnvironmentUrls } from 'Roblox';
import { localStorageService } from 'core-roblox-utilities';
import catalogConstants from '../../constants/catalogConstants';
import { TopUp } from '../../constants/types';
import useExperimentationService from './experimentationService';
import experimentConstants from '../../constants/experimentConstants';

type AvatarShopRecommendationsAndSearchWeb = {
  autoSelectItems: boolean;
  shoppingCartEnabled: boolean;
  shoppingCartTreatment: string;
  directPurchaseEnabled?: boolean | null;
};

type AvatarShopMarketplaceGuidedFeaturesEnrollment = {
  topicsEnabledWeb: boolean;
  topicsVariant: number;
  treatment: number;
  infiniteScroll?: boolean | null;
};

type AvatarShopRecommendationsAndSearchEnrollment = {
  OnlineReRankingStrategyProfileId: string;
  rifyRecommendationRoot: boolean;
  topUpVariant?: string | null;
  topUpEnabled?: boolean | null;
};

function useAvatarEnrollments() {
  const [topUp, setTopUp] = useState<TopUp>({
    featureEnabled: false,
    showTopUp: false,
    currentUserBalance: -1,
    headerText: 'Heading.NeedMoreRobux',
    messageText: 'Message.RunningLowRobux',
    buttonText: 'Action.BuyRobux',
    buttonUrl: `${EnvironmentUrls.websiteUrl}/upgrades/robux?ctx=catalogNew`
  });

  const [directPurchaseEnabled, setDirectPurchaseEnabled] = useState<boolean>();

  const [isSearchOnBlurEnabled, setIsSearchOnBlurEnabled] = useState<boolean>(false);

  const [
    landingPageInfiniteScrollEnabled,
    setLandingPageInfiniteScrollEnabled
  ] = useState<boolean>();

  const checkShowTopUpWidget = () => {
    const lastClearedTimestamp = localStorageService.getLocalStorage(
      `Roblox.AvatarMarketplace.TopUpClearDate-${CurrentUser.userId}`
    ) as number;
    const showTopUp = Date.now() - lastClearedTimestamp > catalogConstants.topUp.resetTime;
    setTopUp(prevTopUp => ({ ...prevTopUp, showTopUp }));
  };

  const experimentationService = useExperimentationService();

  const getAvatarShopPageEnrollment = useCallback(() => {
    experimentationService
      .getABTestEnrollment(
        experimentConstants.defaultProjectId,
        experimentConstants.layerNames.avatarShopPage,
        experimentConstants.parameterNames.avatarShopPage
      )
      .then(
        function success(result) {
          // no op
        },
        function error() {
          // no op
        }
      );
  }, [experimentationService]);

  const getAvatarShopRecommendationsAndSearchWebEnrollment = useCallback(() => {
    experimentationService
      .getABTestEnrollment<AvatarShopRecommendationsAndSearchWeb>(
        experimentConstants.defaultProjectId,
        experimentConstants.layerNames.avatarShopRecommendationsAndSearchWeb,
        experimentConstants.parameterNames.avatarShopRecommendationsAndSearchWeb
      )
      .then(
        function success(result) {
          if (
            result?.directPurchaseEnabled !== undefined &&
            result?.directPurchaseEnabled !== null
          ) {
            setDirectPurchaseEnabled(result.directPurchaseEnabled);
          }
        },
        function error() {
          // no op
        }
      );
  }, [experimentationService]);

  const getAvatarShopRecommendationsAndSearchEnrollment = useCallback(() => {
    experimentationService
      .getABTestEnrollment<AvatarShopMarketplaceGuidedFeaturesEnrollment>(
        experimentConstants.defaultProjectId,
        experimentConstants.layerNames.avatarShopRecommendationsAndSearch,
        experimentConstants.parameterNames.avatarShopRecommendationsAndSearch
      )
      .then(
        function success(result) {
          if (result?.infiniteScroll !== undefined && result?.infiniteScroll !== null) {
            setLandingPageInfiniteScrollEnabled(result.infiniteScroll);
          }
        },
        function error() {
          // no op
        }
      );
  }, [experimentationService]);

  const getAvatarMarketplaceGuidedFeaturesEnrollment = useCallback(() => {
    experimentationService
      .getABTestEnrollment<AvatarShopRecommendationsAndSearchEnrollment>(
        experimentConstants.defaultProjectId,
        experimentConstants.layerNames.avatarMarketplaceGuidedFeatures,
        experimentConstants.parameterNames.avatarMarketplaceGuidedFeatures
      )
      .then(
        function success(result) {
          if (result?.topUpEnabled !== undefined && result?.topUpEnabled !== null) {
            setTopUp(prevTopUp => ({
              ...prevTopUp,
              featureEnabled: !!result.topUpEnabled
            }));

            if (
              topUp.featureEnabled &&
              result?.topUpVariant !== undefined &&
              result?.topUpVariant !== null
            ) {
              if (result?.topUpVariant === 'zeroBalance') {
                setTopUp(prevTopUp => ({
                  ...prevTopUp,
                  featureEnabled: true,
                  robuxMinThreshold: -1,
                  robuxMaxThreshold: 0,
                  displayCategories: catalogConstants.topUp.displayCategories,
                  headerText: 'Heading.NeedMoreRobux',
                  messageText: 'Message.WithRobux',
                  buttonText: 'Action.BuyRobux',
                  buttonUrl: `${EnvironmentUrls.websiteUrl}/upgrades/robux?ctx=catalogNew`
                }));
              } else if (result?.topUpVariant === 'lowBalance') {
                setTopUp(prevTopUp => ({
                  ...prevTopUp,
                  featureEnabled: true,
                  robuxMinThreshold: 1,
                  robuxMaxThreshold: catalogConstants.topUp.robuxThreshold,
                  displayCategories: catalogConstants.topUp.displayCategories,
                  headerText: 'Heading.NeedMoreRobux',
                  messageText: 'Message.RunningLowRobux',
                  buttonText: 'Action.BuyRobux',
                  buttonUrl: `${EnvironmentUrls.websiteUrl}/upgrades/robux?ctx=catalogNew`
                }));
              } else if (result?.topUpVariant === 'giftCard') {
                setTopUp(prevTopUp => ({
                  ...prevTopUp,
                  featureEnabled: true,
                  robuxMinThreshold: -1,
                  robuxMaxThreshold: 0,
                  displayCategories: catalogConstants.topUp.displayCategories,
                  headerText: 'Heading.TreatYourself',
                  messageText: 'Message.GiftCardPurchase',
                  buttonText: 'Action.ShopGiftCards',
                  buttonUrl: 'https://roblox.cashstar.com/gift-card/buy/?ref=1023gcwidget',
                  giftCard: true
                }));
              }

              checkShowTopUpWidget();
            }
          }
        },
        function error() {
          // no op
        }
      );
  }, [experimentationService, topUp.featureEnabled]);

  const getAvatarMarketplaceShoppingCartEnrollment = useCallback(() => {
    experimentationService
      .getABTestEnrollment(
        experimentConstants.defaultProjectId,
        experimentConstants.layerNames.avatarShopRecommendationsAndSearchWeb,
        experimentConstants.parameterNames.avatarMarketplaceShoppingCart
      )
      .then(
        function success(result) {
          // no op
        },
        function error() {
          // no op
        }
      );
  }, [experimentationService]);

  const getAvatarSortsEnrollment = useCallback(() => {
    experimentationService
      .getABTestEnrollment(
        experimentConstants.defaultProjectId,
        experimentConstants.layerNames.avatarMarketplaceSorts,
        experimentConstants.parameterNames.avatarMarketplaceSorts
      )
      .then(
        function success(result) {
          // no op
        },
        function error() {
          // no op
        }
      );
  }, [experimentationService]);

  const getAvatarEnrollments = useCallback(() => {
    // getAvatarShopPageEnrollment();
    getAvatarShopRecommendationsAndSearchWebEnrollment();
    getAvatarShopRecommendationsAndSearchEnrollment();
    getAvatarMarketplaceGuidedFeaturesEnrollment();
    // getAvatarMarketplaceShoppingCartEnrollment();
    // getAvatarSortsEnrollment();
  }, [
    getAvatarMarketplaceGuidedFeaturesEnrollment,
    // getAvatarMarketplaceShoppingCartEnrollment,
    // getAvatarShopPageEnrollment,
    getAvatarShopRecommendationsAndSearchEnrollment,
    getAvatarShopRecommendationsAndSearchWebEnrollment
    // getAvatarSortsEnrollment
  ]);

  return {
    topUp,
    setTopUp,
    isSearchOnBlurEnabled,
    getAvatarEnrollments
  };
}

export default useAvatarEnrollments;
