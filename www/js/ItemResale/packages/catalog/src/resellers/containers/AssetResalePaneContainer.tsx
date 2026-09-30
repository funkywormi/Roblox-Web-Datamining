import React, { useCallback, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { WithTranslationsProps, withTranslations } from "react-utilities";
import {
  AvatarAccoutrementService,
  ItemDetailsHydrationService,
} from "@rbx/legacy-webapp-types/Roblox";
import { isAuthenticated, userId } from "@rbx/core-scripts/meta/user";
import resellersConstants, { TResellersTab } from "../constants/resellersConstants";
import { TAssetData, TEconomyMetadata, TResaleData } from "../constants/types";
import translationConfig from "../translation.config";
import resaleService from "../services/resaleService";
import AssetResaleDataPane from "../components/AssetResaleDataPane";
import ResellersPaneContainer from "./ResellersPaneContainer";
import { trackError } from "../../observability";

export type TAssetResalePaneContainerProps = {
  assetId: number | string;
  isBundle?: boolean;
  assetData: TAssetData;
  economyMetadata: TEconomyMetadata;
};

type TItemDetail = {
  itemRestrictions?: string[];
  assetType?: number;
  collectibleItemId?: string;
  collectibleItemDetails?: {
    resaleRestriction?: number;
    assetStock?: number;
    sales?: number;
    price?: number;
  };
};

const checkIfItemIsResellable = (details: TItemDetail): boolean => {
  const restrictions = details.itemRestrictions ?? [];
  return (
    restrictions.indexOf("Collectible") > -1 ||
    restrictions.indexOf("Limited") > -1 ||
    restrictions.indexOf("LimitedUnique") > -1
  );
};

export const AssetResalePaneContainer = ({
  assetId,
  isBundle,
  assetData,
  economyMetadata,
  translate,
}: TAssetResalePaneContainerProps & WithTranslationsProps): JSX.Element => {
  const { resellersTabs } = resellersConstants;
  const itemType = isBundle === true ? "bundle" : "asset";

  const [resellableItem, setResellableItem] = useState<boolean | undefined>(undefined);
  const [resaleData, setResaleData] = useState<TResaleData | undefined>(undefined);
  const [isLimited2, setIsLimited2] = useState(false);
  const [resaleRestriction, setResaleRestriction] = useState<number | undefined>(undefined);
  const [loadingResaleData, setLoadingResaleData] = useState(false);
  const [resaleDataLoadFailure, setResaleDataLoadFailure] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TResellersTab>(resellersTabs.priceChart);

  const authenticatedUser = useRef(isAuthenticated() ? { id: Number(userId()) } : null).current;

  // Mirrors the `if (ctrl.loadingResaleData) return` guard, which a state read cannot do inside one
  // React tick.
  const loadingRef = useRef(false);
  const itemDetailsRef = useRef<TItemDetail | undefined>(undefined);
  const collectibleItemIdRef = useRef<string | undefined>(undefined);

  const loadResaleData = useCallback(() => {
    if (loadingRef.current) {
      return;
    }
    loadingRef.current = true;
    setLoadingResaleData(true);
    setResaleDataLoadFailure(false);

    const finish = () => {
      loadingRef.current = false;
      setLoadingResaleData(false);
    };

    if (collectibleItemIdRef.current) {
      const collectibleItemId = collectibleItemIdRef.current;
      ItemDetailsHydrationService.getItemDetails([{ id: assetId, itemType }], undefined, true)
        .then((itemDetails: TItemDetail[]) => {
          const marketplaceItemDetails = itemDetails[0]?.collectibleItemDetails;
          const limitedDetails: TResaleData = {
            assetStock: marketplaceItemDetails?.assetStock,
            assetType: AvatarAccoutrementService.getAssetTypeNameById(
              itemDetailsRef.current?.assetType ?? 0,
            ),
            collectibleItemId,
            sales: marketplaceItemDetails?.sales,
            originalPrice: marketplaceItemDetails?.price,
          };

          return resaleService
            .getLimited2AssetResaleData(collectibleItemId)
            .then(fetched => {
              setResaleData({
                ...limitedDetails,
                priceDataPoints: fetched.priceDataPoints,
                volumeDataPoints: fetched.volumeDataPoints,
                recentAveragePrice: fetched.recentAveragePrice,
              });
              finish();
            })
            .catch((error: unknown) => {
              trackError("ResaleDataLoadFailed", null, error);
              setResaleData(undefined);
              setResaleDataLoadFailure(true);
              finish();
            });
        })
        .catch((error: unknown) => {
          trackError("ResaleDataLoadFailed", null, error);
          setResaleData(undefined);
          setResaleDataLoadFailure(true);
          finish();
        });
      return;
    }

    resaleService
      .getAssetResaleData(assetId)
      .then(fetched => {
        setResaleData(fetched);
        finish();
      })
      .catch((error: unknown) => {
        trackError("ResaleDataLoadFailed", null, error);
        setResaleData(undefined);
        setResaleDataLoadFailure(true);
        finish();
      });
  }, [assetId, itemType]);

  useEffect(() => {
    ItemDetailsHydrationService.getItemDetails([{ id: assetId, itemType }], undefined, true)
      .then((details: TItemDetail[]) => {
        const detail = details[0];
        if (!detail || !checkIfItemIsResellable(detail)) {
          setResellableItem(false);
          return;
        }
        setResellableItem(true);
        itemDetailsRef.current = detail;
        if (detail.collectibleItemId) {
          setResaleRestriction(detail.collectibleItemDetails?.resaleRestriction);
          setIsLimited2(true);
          collectibleItemIdRef.current = detail.collectibleItemId;
          setSelectedTab(resellersTabs.inventory);
        }
        loadResaleData();
      })
      .catch((error: unknown) => {
        trackError("ResaleDataLoadFailed", null, error);
        setResaleDataLoadFailure(true);
        loadingRef.current = false;
        setLoadingResaleData(false);
      });
  }, []);

  if (!resellableItem) {
    return <div className="rbx-tabs-horizontal resale-pricechart-tabs" />;
  }

  const tabClasses = (tabName: TResellersTab) =>
    classNames("tab-pane", {
      active: tabName === selectedTab,
    });

  return (
    <div className="rbx-tabs-horizontal resale-pricechart-tabs">
      <div>
        {!!resaleData && !!authenticatedUser && (
          <div>
            <ul id="horizontal-tabs" className="nav nav-tabs" role="tablist">
              {[
                { tab: resellersTabs.inventory, label: "Label.YourInventory" },
                { tab: resellersTabs.priceChart, label: "Heading.PriceChart" },
                ...(isLimited2 && resaleRestriction !== resellersConstants.resaleRestrictionDisabled
                  ? [{ tab: resellersTabs.resellers, label: "Heading.Resellers" }]
                  : []),
              ].map(({ tab, label }) => (
                <li key={tab} className={classNames("rbx-tab", { active: tab === selectedTab })}>
                  <button
                    type="button"
                    className="rbx-tab-heading"
                    role="tab"
                    aria-selected={tab === selectedTab}
                    onClick={() => {
                      setSelectedTab(tab);
                    }}
                  >
                    <span className="text-lead">{translate(label)}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="tab-content rbx-tab-content">
              <div
                id="price-chart"
                className={classNames(tabClasses(resellersTabs.priceChart), "price-chart-section")}
              >
                <div className="container-header">
                  <h2>{translate("Heading.PriceChart")}</h2>
                </div>
                <AssetResaleDataPane resaleData={resaleData} isLimited2={isLimited2} />
              </div>
              <div
                id="item-details-limited-inventory-container"
                className={tabClasses(resellersTabs.inventory)}
                data-target-id={assetId}
                data-is-bundle={String(!!isBundle)}
              />
              {isLimited2 && resaleRestriction !== resellersConstants.resaleRestrictionDisabled && (
                <div
                  id="resellers"
                  className={classNames(tabClasses(resellersTabs.resellers), "resellers-container")}
                >
                  <div className="container-header">
                    <h2>{translate("Heading.Resellers")}</h2>
                  </div>
                  <ResellersPaneContainer
                    resaleData={resaleData}
                    assetData={assetData}
                    economyMetadata={economyMetadata}
                    isLimited2={isLimited2}
                    itemType={itemType}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Logged out shows the price chart alone, and passes no is-limited-2, so it always takes the
            Limited 1 formatter regardless of the item's tier. */}
        {!!resaleData && !authenticatedUser && (
          <div className="tab-content rbx-tab-content">
            <div className="container-header">
              <h2>{translate("Heading.PriceChart")}</h2>
            </div>
            <AssetResaleDataPane resaleData={resaleData} />
          </div>
        )}

        {loadingResaleData && (
          <div className="section-content price-chart-spinner">
            <span className="spinner spinner-default" />
          </div>
        )}
        {resaleDataLoadFailure && (
          <div className="section-content-off">
            <span>{translate("Label.ResaleDataLoadFailure")}</span>
            {/* Angular used a bare <a ng-click>. core-ui's btn-to-link mixin styles
                .refresh-link-icon for a button (it overrides button background and border), so the
                element changes and the rendered result does not. */}
            <button type="button" className="refresh-link-icon" onClick={loadResaleData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default withTranslations(AssetResalePaneContainer, translationConfig);
