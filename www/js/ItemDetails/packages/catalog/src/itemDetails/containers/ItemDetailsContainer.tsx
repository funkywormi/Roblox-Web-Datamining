import React, { useEffect, useRef, useState } from "react";
import environmentUrls from "@rbx/environment-urls";
import { isAuthenticated, userId } from "@rbx/core-scripts/meta/user";
import itemDetailsConstants from "../constants/itemDetailsConstants";
import itemDetailsService, {
  isAllowedInShowcase,
  isClassicAssetType,
  TItemDetail,
} from "../services/itemDetailsService";
import { getIsBundle, getItemType, getTargetId } from "../utils/pageIdentity";
import { trackCounter, trackCriticalError } from "../../observability";

type TDerivedState = {
  loaded: boolean;
  purchaseParamsLoaded: boolean;
  itemDetail?: TItemDetail;
  thumbnailUrl?: string;
  currentUserBalance?: number;
  isAnimationBundle: boolean;
  isClassicAssetType: boolean;
  canReportItem: boolean;
  canDeleteItem: boolean;
  canPurchaseItem?: boolean;
  allowedInShowcase: boolean;
  isInShowcase: boolean;
  canConfigureItem?: boolean;
  canSponsorItem?: boolean;
};

const initialState: TDerivedState = {
  loaded: false,
  purchaseParamsLoaded: false,
  isAnimationBundle: false,
  isClassicAssetType: false,
  canReportItem: false,
  canDeleteItem: false,
  canPurchaseItem: false,
  allowedInShowcase: false,
  isInShowcase: false,
  canConfigureItem: false,
  canSponsorItem: false,
};

const dispatchItemListRender = (detail: Record<string, unknown>) => {
  window.dispatchEvent(new CustomEvent(itemDetailsConstants.itemListEventName, { detail }));
};

const ItemDetailsContainer = (): JSX.Element => {
  const identity = useRef(
    (() => {
      const isBundle = getIsBundle();
      return { isBundle, itemType: getItemType(isBundle), targetId: getTargetId(isBundle) };
    })(),
  ).current;
  const { isBundle, itemType, targetId } = identity;

  const [state, setState] = useState<TDerivedState>(initialState);

  useEffect(() => {
    const merge = (next: Partial<TDerivedState>) => {
      setState(current => ({ ...current, ...next }));
    };

    const loadData = async () => {
      let itemDetail: TItemDetail;
      try {
        const result = await itemDetailsService.getDetails(targetId, isBundle);
        if (result === null) {
          window.location.href = `${environmentUrls.websiteUrl}/catalog`;
          return;
        }
        itemDetail = result;

        const derived: Partial<TDerivedState> = {
          itemDetail: result,
          canReportItem: result.creatorTargetId !== itemDetailsConstants.robloxCreatorTargetId,
          canPurchaseItem: result.purchasable,
        };

        if (isBundle) {
          const animationBundle = result.bundleType === itemDetailsConstants.animationBundleType;
          derived.isAnimationBundle = animationBundle;
          derived.allowedInShowcase = !animationBundle;
          const items = (result.bundledItems ?? [])
            .filter(
              bundledItem =>
                bundledItem.type.toLowerCase() === "asset" ||
                bundledItem.type.toLowerCase() === "bundle",
            )
            .map(bundledItem => ({ id: bundledItem.id, itemType: bundledItem.type }));
          merge(derived);
          dispatchItemListRender({
            items,
            purchasable: false,
            selectable: false,
            backgroundVisualContainer: false,
            titleText: "Included Items",
            wrapItems: true,
            eventIdentifier: itemDetailsConstants.eventIdentifiers.includedItems,
            showCreatorName: false,
            showPrice: false,
            showItemType: true,
            checkOwnership: false,
          });
        } else {
          derived.canDeleteItem = false;
          derived.allowedInShowcase = isAllowedInShowcase(result.assetType);
          derived.isClassicAssetType = isClassicAssetType(result.assetType);
          merge(derived);
        }

        try {
          const thumbnailPromise = isBundle
            ? itemDetailsService.getBundleThumbnail(targetId)
            : itemDetailsService.getAssetThumbnail(targetId);
          const balancePromise = isAuthenticated()
            ? itemDetailsService.getCurrentUserBalance(userId())
            : undefined;
          const [thumbnail, balance] = await Promise.all([thumbnailPromise, balancePromise]);
          merge({
            thumbnailUrl: thumbnail.data[0]?.imageUrl,
            currentUserBalance: isAuthenticated() ? balance?.robux : undefined,
            purchaseParamsLoaded: true,
          });
        } catch {
          trackCounter("PurchaseParamsLoadFailed");
          merge({ purchaseParamsLoaded: true });
        }
      } catch (e) {
        const code = (e as { errors?: { code?: number }[] })?.errors?.[0]?.code;
        if (code !== itemDetailsConstants.errorCodes.itemNotFound) {
          trackCriticalError("ItemDetailsPageLoadFailed", null, e);
        }
        window.location.href =
          code === itemDetailsConstants.errorCodes.itemNotFound
            ? `${environmentUrls.websiteUrl}/catalog`
            : `${environmentUrls.websiteUrl}/request-error`;
        return;
      }

      const type = isBundle ? itemDetail.bundleType : itemDetail.assetType;
      itemDetailsService
        .getRecommendations(targetId, type, itemDetailsConstants.recommendationsCount, isBundle)
        .then(recommendations => {
          dispatchItemListRender({
            items: recommendations.data.map(recommendation => ({
              id: recommendation,
              itemType,
            })),
            purchasable: false,
            selectable: false,
            backgroundVisualContainer: true,
            titleText: "Recommendations",
            wrapItems: false,
            eventIdentifier: itemDetailsConstants.eventIdentifiers.recommendations,
            checkOwnership: true,
          });
        })
        .catch(() => {
          // Swallowed: the row simply does not render.
        });

      if (!isAuthenticated()) {
        merge({ loaded: true });
        return;
      }

      Promise.all([
        itemDetailsService.getCanConfigure(targetId, isBundle),
        itemDetailsService.getUserShowcase(userId()),
        isBundle ? undefined : itemDetailsService.getCanSponsor(targetId),
      ])
        .then(([canConfigure, showcase, canSponsor]) => {
          const next: Partial<TDerivedState> = {
            canConfigureItem: canConfigure.isAllowed,
            loaded: true,
          };
          showcase.forEach(element => {
            if (
              element.id.toString() === targetId.toString() &&
              element.assetSeoUrl.includes(isBundle ? "bundles" : "catalog")
            ) {
              next.isInShowcase = true;
            }
          });
          if (!isBundle) {
            next.canSponsorItem = canSponsor?.[targetId];
          }
          merge(next);
        })
        .catch(() => {
          merge({ loaded: true });
        });
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises -- matches loadData(), which the Angular $onInit does not await
    loadData();
  }, []);

  const {
    loaded,
    purchaseParamsLoaded,
    itemDetail,
    thumbnailUrl,
    currentUserBalance,
    isAnimationBundle,
    canReportItem,
    canDeleteItem,
    canPurchaseItem,
    allowedInShowcase,
    isInShowcase,
    canConfigureItem,
    canSponsorItem,
  } = state;

  return (
    <div className="content">
      {purchaseParamsLoaded && (
        <div
          id="ItemPurchaseAjaxData"
          data-user-balance-robux={currentUserBalance}
          data-imageurl={thumbnailUrl}
        />
      )}
      <div className="page-content menu-shown">
        <div>
          <div className="clearfix">
            {loaded && (
              <div
                id="item-thumbnail-container-frontend"
                data-target-id={targetId}
                data-is-bundle={isBundle}
                data-is-animation-bundle={isAnimationBundle}
                data-show-3d-mode-button={!state.isClassicAssetType}
                data-show-try-on-button={!isAnimationBundle}
              />
            )}
            {loaded && (
              <div
                id="item-info-container-frontend"
                data-target-id={targetId}
                data-is-bundle={isBundle}
                data-can-report-item={canReportItem}
                data-is-deletable-type={canDeleteItem}
                // Undefined must stay undefined: consumers distinguish an absent attribute from "false".
                data-can-manage-item={canConfigureItem || canSponsorItem}
                data-can-view-configure-page={canConfigureItem}
                data-can-configure-item={canConfigureItem}
                data-can-sponsor-item={canSponsorItem}
                data-is-allowed-in-showcase={allowedInShowcase}
                data-is-in-showcase={isInShowcase}
                data-is-moderated="False"
                data-is-purchase-enabled={canPurchaseItem}
                data-group-last-edited-by-id=""
                data-group-last-edited-by-name=""
                data-can-view-develop-page="False"
                data-is-not-currently-for-sale="False"
              />
            )}
            <div id="favorites-button" data-asset-id={targetId} data-item-type={itemType} />
            <div id="item-report-button-frontend" />
          </div>
          <br />
          {/* Angular rendered <asset-resale-pane> here and passed asset-id / is-bundle as component
              bindings. The React pane ships as its own SCC and mounts into this id, so those two
              arrive as data-target-id / data-is-bundle; the four attributes the pane already read
              back off this element are unchanged. */}
          {loaded && (
            <div
              id="asset-resale-data-container"
              data-target-id={targetId}
              data-is-bundle={isBundle}
              data-item-name={itemDetail?.name}
              data-asset-type={itemDetail?.assetType}
              data-product-id={itemDetail?.productId}
              data-is-purchase-enabled="true"
            />
          )}
          <div id="item-list-container-recommendations" data-event-identifier="recommendations" />
          <div id="sponsored-catalog-items" data-placement-location="ItemDetails" />
          <div id="item-list-container-included-items" data-event-identifier="included-items" />
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsContainer;
