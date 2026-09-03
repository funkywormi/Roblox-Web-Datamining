import { initRobloxBadgesFrameworkAgnostic, translatedVerifiedBadgeTitleText } from 'roblox-badges';
import recommendationsModule from '../recommendationsModule.js';
import experimentConstants from '../constants/experimentConstants';

function recommendationsController(
  $rootScope,
  recommendationsService,
  recommendationsConstants,
  $log,
  itemsListService,
  urlService,
  itemListConstants,
  itemsListLayoutService,
  experimentationService,
  $scope
) {
  'ngInject';

  const ctrl = this;
  const library = {
    currentPageName: null,
    isMetaDataLoaded: false
  };
  ctrl.recommendationNumRows = 1;
  ctrl.complimentaryItemRecommendations = {
    enabled: false,
    targetId: undefined,
    isBundle: false
  };

  ctrl.dismissPlaceholderForRecommendation = function () {
    $rootScope.isPlaceholderOff = true;

    // TODO: FOR ROLLOUT FALLBACK so web release and webapps release can be independent
    $rootScope.isRecommendationsLoaded = true;

    // bootstraps the verified badges component
    try {
      initRobloxBadgesFrameworkAgnostic({
        overrideIconClass: 'verified-badge-icon-item-recommendations'
      });
    } catch (e) {
      // noop
    }
  };

  ctrl.showFrontendBasedResellersComponent = function () {
    if (ctrl.pageName === 'BundleDetail') {
      return true;
    }
    return false;
  };

  ctrl.isBundle = function () {
    if (ctrl.pageName === 'BundleDetail') {
      return true;
    }
    return false;
  };

  function checkMoreByCreatorAvailability() {
    ctrl.isMoreByCreatorEnabled =
      ctrl.itemCreator && Object.prototype.hasOwnProperty.call(ctrl.itemCreator, 'Id');
    $scope.itemCreator = ctrl.itemCreator;
  }

  function renderComplimentaryItems() {
    window.dispatchEvent(
      new CustomEvent('complimentary-items:render', {
        detail: {
          targetId: ctrl.complimentaryItemRecommendations.targetId,
          isBundle: ctrl.complimentaryItemRecommendations.isBundle,
          displayPurchaseButtonLeft: ctrl.complimentaryItemRecommendations.displayPurchaseButtonLeft
        }
      })
    );
  }

  function getComplimentaryItemRecommendationsEnrollment() {
    const { recommendationTargetId, subject, pageName } = ctrl;
    if (
      !recommendationsConstants.complimentaryItemRecommendationsSupportedPages.includes(pageName)
    ) {
      return;
    }
    experimentationService
      .getABTestEnrollment(
        experimentConstants.defaultProjectId,
        experimentConstants.layerNames.avatarShopRecommendationsAndSearchWeb,
        experimentConstants.parameterNames.complimentaryItemRecommendationsEnabled
      )
      .then(
        function success(result) {
          if (
            result?.complimentaryItemRecommendationsEnabled !== undefined &&
            result?.complimentaryItemRecommendationsEnabled !== null
          ) {
            ctrl.complimentaryItemRecommendations.enabled =
              result?.complimentaryItemRecommendationsEnabled;
            if (ctrl.complimentaryItemRecommendations.enabled) {
              ctrl.complimentaryItemRecommendations.targetId = recommendationTargetId;
              ctrl.complimentaryItemRecommendations.isBundle =
                subject === recommendationsConstants.itemTypes.bundle;
              ctrl.complimentaryItemRecommendations.displayPurchaseButtonLeft =
                result.displayPurchaseButtonLeft;
              renderComplimentaryItems();
            }
          }
        },
        function error() {}
      );
  }

  function getAvatarMarketplaceRelevanceRecommendationsEnrollment() {
    experimentationService
      .getABTestEnrollment(
        experimentConstants.defaultProjectId,
        experimentConstants.layerNames.avatarMarketplaceRelevanceRecommendations,
        experimentConstants.parameterNames.avatarMarketplaceRelevanceRecommendations
      )
      .then(
        function success(result) {},
        function error() {}
      );
  }

  function getAvatarMarketplaceEditorEnrollment() {
    experimentationService
      .getABTestEnrollment(
        experimentConstants.defaultProjectId,
        experimentConstants.layerNames.avatarMarketplaceEditor,
        experimentConstants.parameterNames.avatarMarketplaceEditor
      )
      .then(
        function success(result) {},
        function error() {}
      );
  }

  const initRecommendations = () => {
    const { recommendationSubtype, recommendationType, recommendationItemtypes, pageName } = ctrl;
    recommendationsService.overrideRecommendationTypes(recommendationItemtypes);
    if (recommendationsService.isRecommendationAllowed(recommendationType, recommendationSubtype)) {
      if (library.currentPageName !== pageName) {
        ctrl.absoluteCatalogUrl = urlService.getAbsoluteUrl(recommendationsConstants.urls.catalog);
        if (!ctrl.recommendationTargetId) {
          ctrl.recommendationTargetId = 0;
        }
        library.currentPageName = pageName;
        recommendationsService.getRecommendationMetadata(pageName).then(
          function success(recommendationsMetadata) {
            Object.assign(ctrl, recommendationsMetadata);
            recommendationsService.getCatalogMetadata().then(
              function success(catalogMetadata) {
                library.isPremiumIconOnItemTilesEnabled =
                  catalogMetadata.isPremiumIconOnItemTilesEnabled;
                library.isPremiumPriceOnItemTilesEnabled =
                  catalogMetadata.isPremiumPriceOnItemTilesEnabled;
                library.isMetaDataLoaded = true;
                getComplimentaryItemRecommendationsEnrollment();
                getAvatarMarketplaceRelevanceRecommendationsEnrollment();
                // No active experiments on layer
                // getAvatarMarketplaceEditorEnrollment();
                if (ctrl.numberOfItems) {
                  experimentationService
                    .getABTestEnrollment(
                      experimentConstants.defaultProjectId,
                      experimentConstants.layerNames.avatarShopPage,
                      experimentConstants.parameterNames.recommendationNumRows
                    )
                    .then(
                      function success(result) {
                        if (
                          result?.recommendationPageName !== undefined &&
                          result?.recommendationPageName !== null &&
                          result?.recommendationNumRows !== undefined &&
                          result?.recommendationNumRows !== null
                        ) {
                          if (
                            result.recommendationPageName.length > 0 &&
                            result.recommendationPageName.includes(pageName)
                          ) {
                            ctrl.recommendationNumRows = result.recommendationNumRows;
                          }
                        }
                      },
                      function error() {}
                    )
                    .finally(() => {
                      ctrl.getItems();
                    });
                }
              },
              function error() {
                $log.debug(' ------ getCatalogMetadata error -------');
                ctrl.dismissPlaceholderForRecommendation();
              }
            );
          },
          function error() {
            $log.debug(' ------ getRecommendationsMetadata error -------');
            ctrl.dismissPlaceholderForRecommendation();
          }
        );
      } else if (library.isMetaDataLoaded && ctrl.numberOfItems) {
        ctrl.getItems();
      }
    } else {
      ctrl.clearItems();
    }

    ctrl.dismissPlaceholderForRecommendation();
  };

  ctrl.clearItems = () => {
    ctrl.items = [];
  };

  ctrl.getItems = () => {
    ctrl.items = [];
    let { recommendationType, recommendationSubtype } = ctrl;
    const { recommendationTargetId, numberOfItems, subject, recommendationNumRows } = ctrl;
    recommendationsConstants.recommendationSubtypeOverrides.forEach(overrideType => {
      if (
        overrideType.assetTypes.includes(recommendationSubtype) &&
        overrideType.subject === subject
      ) {
        recommendationSubtype = overrideType.newSubtype;
        recommendationType = overrideType.newType;
      }
    });

    recommendationsService
      .beginUpdateRecommendedItems(
        recommendationTargetId,
        recommendationType,
        recommendationSubtype,
        numberOfItems * recommendationNumRows,
        subject
      )
      .then(
        result => {
          ctrl.items = result;
        },
        () => {
          $log.debug(' ------ beginUpdateRecommendedItems error -------');
        }
      )
      .finally(() => {
        ctrl.dismissPlaceholderForRecommendation();
      });
  };

  function doesItemHavePremiumPrice(item) {
    return item.premiumPrice !== undefined && item.premiumPrice !== null;
  }

  ctrl.showVerifiedBadge = item => {
    return item && item.creatorHasVerifiedBadge;
  };

  ctrl.isNotExperienceOnlySaleLocationWithNoResellers = item => {
    return item.saleLocationType !== 'ExperiencesDevApiOnly' || item.hasResellers;
  };

  ctrl.getDisplayPrice = item => {
    if (library.isPremiumPriceOnItemTilesEnabled && doesItemHavePremiumPrice(item)) {
      return item.premiumPrice;
    }
    if (item.lowestPrice) {
      return item.lowestPrice;
    }

    return item.price;
  };

  ctrl.shouldShowPremiumIcon = item => {
    return library.isPremiumIconOnItemTilesEnabled && doesItemHavePremiumPrice(item);
  };

  ctrl.getSeeAllLink = () => {
    const { seeAllRecommendationLinks } = recommendationsConstants;
    let { recommendationType } = ctrl;
    if (recommendationType === undefined) {
      recommendationType = 0;
    }
    if (
      seeAllRecommendationLinks[recommendationType] !== undefined &&
      seeAllRecommendationLinks[recommendationType][ctrl.recommendationSubtype] !== undefined
    ) {
      return seeAllRecommendationLinks[recommendationType][ctrl.recommendationSubtype];
    }
    return ctrl.absoluteCatalogUrl;
  };

  const initialized = () => {
    initRecommendations();
    checkMoreByCreatorAvailability();
  };

  ctrl.$onInit = initialized;

  $scope.$watch(
    () => {
      return {
        recommendationType: ctrl.recommendationType,
        recommendationSubtype: ctrl.recommendationSubtype
      };
    },
    (newVals, oldVals) => {
      if (
        (typeof oldVals.recommendationType === 'number' &&
          newVals.recommendationType !== oldVals.recommendationType) ||
        (typeof oldVals.recommendationSubtype === 'number' &&
          newVals.recommendationSubtype !== oldVals.recommendationSubtype)
      ) {
        initRecommendations();
      }
    },
    true
  );
}

recommendationsModule.controller('recommendationsController', recommendationsController);
export default recommendationsController;
