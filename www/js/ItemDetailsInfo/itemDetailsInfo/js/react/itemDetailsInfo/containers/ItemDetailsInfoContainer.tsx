import React, { useState, useEffect, useCallback } from 'react';
import { AXAnalyticsService, CurrentUser, ItemDetailsHydrationService } from 'Roblox';
import { AxiosResponse } from 'core-utilities';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { Loading } from 'react-style-guide';
import { useLocation } from 'react-router-dom';
import translationConfig from '../translation.config';
import ItemDetailsInfoService from '../services/itemDetailsInfoService';
import {
  TAssetItemDetails,
  TBundleItemDetails,
  TOwnedItemInstance,
  TUserItemPermissions,
  TL2ResellableCopies,
  TL2ResellableCopy
} from '../constants/types';
import ItemDetailsInfoHeader from '../components/ItemDetailsInfoHeader';
import ItemDetailsInfoBody from '../components/ItemDetailsInfoBody';
import ItemDetailsReportButton from '../components/ItemDetailsReportButton';
import { useResellers } from '../utils/hooks';
import GetABTestEnrollment from '../services/experimentationService';
import experimentationConstants from '../constants/experimentConstants';
import { isFae } from '../utils/itemDetailUtils';

const { AXAnalyticsConstants } = AXAnalyticsService;
export type TItemDetailsInfoContainerProps = {
  permissions: TUserItemPermissions;
  targetId: number;
  isBundle: boolean;
};

export const ItemDetailsInfoContainer = ({
  targetId,
  isBundle,
  permissions
}: TItemDetailsInfoContainerProps & WithTranslationsProps): JSX.Element | null => {
  const [detailsLoaded, setDetailsLoaded] = useState<boolean>(false);
  const [itemDetails, setItemDetails] = useState<TAssetItemDetails | TBundleItemDetails>();
  const [loadingCollectibleDetails, setLoadingCollectibleDetails] = useState<boolean>(true);
  const [collectibleItemDetails, setCollectibleItemDetails] = useState<
    TAssetItemDetails | TBundleItemDetails
  >();
  const [ownedItemInstances, setOwnedItemInstances] = useState<TOwnedItemInstance[]>([]);
  const [userRobuxBalance, setUserRobuxBalance] = useState<number | undefined>(undefined);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>(undefined);
  const [userRobuxBalanceLoaded, setUserRobuxBalanceLoaded] = useState<boolean>(false);
  const [thumbnailUrlLoaded, setThumbnailUrlLoaded] = useState<boolean>(false);
  // Whether the user has FAE feature access ('Granted' from
  // AllowFaeItemToBeClaimed). When true the user has already verified and we
  // show the normal purchase flow.
  const [faeFeatureGranted, setFaeFeatureGranted] = useState<boolean>(false);
  // Whether the user is eligible to see the FAE upsell (ShowFaeUpsell ===
  // 'Granted'). Only meaningful when faeFeatureGranted is false. If this is
  // also false we treat the item as unavailable.
  const [faeUpsellGranted, setFaeUpsellGranted] = useState<boolean>(false);
  // True once we've either checked FAE access or determined the check is
  // unnecessary. Gating the ready-state on this avoids flickering between
  // FAE/normal layouts.
  const [faeAccessChecked, setFaeAccessChecked] = useState<boolean>(false);

  const { resellers } = useResellers(itemDetails);
  const searchParams = new URLSearchParams(window.location.search);
  const initSource = searchParams.get('init_source') || 'unknown';

  // Track view
  useEffect(() => {
    if (detailsLoaded) {
      AXAnalyticsService.sendAXTracking({
        itemName: AXAnalyticsConstants.CatalogItemDetailsView,
        metaData: {
          metaData: initSource // specifies where the user came from
        }
      });
    }
  }, [detailsLoaded, initSource]);

  const getShoppingCartExperiment = useCallback(() => {
    GetABTestEnrollment(experimentationConstants.layerNames.avatarShopRecommendationsAndSearchWeb)
      .then((response: { [parameter: string]: unknown }) => {
        const result = response as Record<string, boolean>;
        // For example:
        // result.shoppingCartEnabled = response.shoppingCartEnabled as boolean;
      })
      .catch(() => {
        console.warn('Could not get Shopping Cart experiment values');
      });
  }, []);

  useEffect(() => {
    getShoppingCartExperiment();
    if (!itemDetails?.itemType) {
      return;
    }
    if (CurrentUser.userId) {
      if (itemDetails.collectibleItemId !== undefined) {
        ItemDetailsInfoService.getLimited2CopiesOwned(
          CurrentUser.userId,
          itemDetails.collectibleItemId,
          500,
          ''
        )
          .then(res => {
            const collectibleOwnedItemInstances = [] as Array<TOwnedItemInstance>;
            res.data.itemInstances.forEach(collectbleItemInstance => {
              collectibleOwnedItemInstances.push({
                collectibleItemInstance: collectbleItemInstance
              });
            });
            setOwnedItemInstances(collectibleOwnedItemInstances);
          })
          .catch(() => null);
      } else {
        ItemDetailsInfoService.getOwnedItem(targetId, itemDetails?.itemType)
          .then(res => {
            setOwnedItemInstances(res?.data?.data || []);
          })
          .catch(() => null);
      }
    }
  }, [targetId, itemDetails?.itemType]);

  useEffect(() => {
    let itemType = 'Asset';
    if (isBundle) {
      itemType = 'Bundle';
    }
    ItemDetailsInfoService.getItemDetails(targetId, itemType)
      .then((response: AxiosResponse<TAssetItemDetails | TBundleItemDetails>) => {
        setItemDetails(response.data);
        if (response.data.collectibleItemId) {
          setLoadingCollectibleDetails(true);
        } else {
          setLoadingCollectibleDetails(false);
        }
        setDetailsLoaded(true);
        return ItemDetailsHydrationService.getItemDetails(
          [{ id: targetId, itemType }],
          undefined,
          true
        );
      })
      .then(function (result) {
        const collectible = result[0]?.collectibleItemDetails;
        const assetType = result[0]?.assetType;
        const itemStatus = result[0]?.itemStatus;

        if (collectible) {
          if (isBundle) {
            const { ...baseItemDetails } = collectible;

            const bundleItemDetails: TBundleItemDetails = {
              ...baseItemDetails,
              bundledItems: [],
              bundleType: result[0].bundleType,
              items: [],
              itemType: 'Bundle'
            };
            setCollectibleItemDetails(bundleItemDetails);
          } else {
            const { ...baseItemDetails } = collectible;

            const assetItemDetails: TAssetItemDetails = {
              ...baseItemDetails,
              assetType,
              itemStatus,
              itemType: 'Asset'
            };
            setCollectibleItemDetails(assetItemDetails);
          }
        }
      })
      .catch(function () {
        setCollectibleItemDetails(undefined);
      })
      .finally(() => {
        setLoadingCollectibleDetails(false);
      });
  }, [targetId, isBundle]);

  // Resolve the FAE access state once item details are available. Three
  // possible outcomes for an FAE-gated item the viewer doesn't own:
  //   1. AllowFaeItemToBeClaimed === 'Granted'  → faeFeatureGranted=true
  //      (user already verified; render the normal purchase flow)
  //   2. AllowFaeItemToBeClaimed !== 'Granted', ShowFaeUpsell === 'Granted'
  //      → faeFeatureGranted=false, faeUpsellGranted=true (render FAE unlock)
  //   3. neither granted → both flags false (render the unavailable layout)
  // For non-FAE items / unauthenticated / owned items we short-circuit
  // immediately to keep the existing flow unchanged.
  useEffect(() => {
    if (!itemDetails) {
      return;
    }

    if (!isFae(itemDetails) || !CurrentUser.isAuthenticated || itemDetails.owned) {
      setFaeFeatureGranted(false);
      setFaeUpsellGranted(false);
      setFaeAccessChecked(true);
      return;
    }

    ItemDetailsInfoService.getIsFaeFeatureGranted()
      .then(featureGranted => {
        setFaeFeatureGranted(featureGranted);
        if (featureGranted) {
          // User is already FAE-verified — no need to check upsell eligibility.
          setFaeUpsellGranted(false);
          setFaeAccessChecked(true);
          return undefined;
        }
        return ItemDetailsInfoService.getIsFaeUpsellGranted().then(upsellGranted => {
          setFaeUpsellGranted(upsellGranted);
          setFaeAccessChecked(true);
        });
      })
      .catch(() => {
        setFaeAccessChecked(true);
      });
  }, [itemDetails]);

  if (
    detailsLoaded === true &&
    itemDetails !== undefined &&
    !loadingCollectibleDetails &&
    faeAccessChecked
  ) {
    if (document.getElementById('routing')) {
      // we are client side rendered
      const metaTitle = document.getElementsByTagName('title').item(0)!;
      metaTitle.innerText = `${itemDetails.name} - Roblox`;
    }

    return (
      <div className='shopping-cart item-details-info-content'>
        <ItemDetailsInfoHeader
          itemDetails={itemDetails || {}}
          ownedItemInstances={ownedItemInstances || []}
          permissions={permissions}
        />
        <ItemDetailsInfoBody
          itemDetails={itemDetails || {}}
          tags={/* localizedTagNames || */ []}
          permissions={permissions}
          ownedItemInstances={ownedItemInstances || []}
          resellers={resellers}
          collectibleItemDetails={collectibleItemDetails}
          purchaseButtonLoaded={!!document.getElementById('ItemPurchaseAjaxData')}
          faeFeatureGranted={faeFeatureGranted}
          faeUpsellGranted={faeUpsellGranted}
        />
        <ItemDetailsReportButton itemDetails={itemDetails} permissions={permissions} />
      </div>
    );
  }
  return <Loading />;
};
export default withTranslations(ItemDetailsInfoContainer, translationConfig);
