import React from "react";
import classNames from "classnames";
import { Thumbnail2d, ThumbnailTypes } from "roblox-thumbnails";
import { BadgeSizes, VerifiedBadgeIconContainer } from "roblox-badges";
import { TranslateFunction } from "react-utilities";
import { TAssetData, TResaleData, TResaleRecord, TTradePermissions } from "../constants/types";

export type TResellerRowProps = {
  resaleRecord: TResaleRecord;
  assetData: TAssetData;
  resaleData: TResaleData;
  isLimited2?: boolean;
  showResellerTradeButton: boolean;
  isPremiumUser: boolean;
  authenticatedUserId?: number;
  resellerTradePermissions: TTradePermissions;
  activeUpgradeTradeBtnId: number | null;
  takeOffSaleDebounce: Record<string, boolean>;
  onBuy: (resaleRecord: TResaleRecord) => void;
  onTradeClick: (resaleRecord: TResaleRecord) => void;
  onUpgradeClick: (resaleRecord: TResaleRecord) => void;
  onNonPremiumTradeClick: (resaleRecord: TResaleRecord) => void;
  onTakeOffSale: (resaleRecord: TResaleRecord) => void;
  getProfilePageUrl: (userId?: number) => string;
  getUserTradeUrl: (userId?: number, sellerAssetId?: number) => string;
  getUpgradeToPremiumUrl: () => string;
  formatNumber: (value: number | null | undefined) => string | number;
  translate: TranslateFunction;
};

// Limited 1 answers `seller.id`, Limited 2 answers `seller.sellerId`.
export const getSellerId = (resaleRecord: TResaleRecord): number | undefined =>
  resaleRecord.seller.id ? resaleRecord.seller.id : resaleRecord.seller.sellerId;

const ResellerRow = ({
  resaleRecord,
  assetData,
  resaleData,
  isLimited2,
  showResellerTradeButton,
  isPremiumUser,
  authenticatedUserId,
  resellerTradePermissions,
  activeUpgradeTradeBtnId,
  takeOffSaleDebounce,
  onBuy,
  onTradeClick,
  onUpgradeClick,
  onNonPremiumTradeClick,
  onTakeOffSale,
  getProfilePageUrl,
  getUserTradeUrl,
  getUpgradeToPremiumUrl,
  formatNumber,
  translate,
}: TResellerRowProps): JSX.Element => {
  const sellerId = getSellerId(resaleRecord);
  const isOwnListing = sellerId === authenticatedUserId;
  // Defaults to true, so a seller with no entry yet reads as still fetching.
  const isFetchingTradePermissions = sellerId
    ? (resellerTradePermissions[sellerId]?.isFetching ?? true)
    : true;
  const canTradeWith = isFetchingTradePermissions
    ? false
    : (sellerId ? resellerTradePermissions[sellerId]?.canTrade : false) || false;
  const hasDiscount =
    resaleRecord.discountInformation?.originalPrice !== undefined &&
    resaleRecord.discountInformation.originalPrice !== null &&
    resaleRecord.price !== undefined &&
    resaleRecord.price !== null &&
    resaleRecord.discountInformation.originalPrice > resaleRecord.price;

  return (
    <li className="reseller-item list-item">
      <a className="list-header reseller-item-avatar" href={getProfilePageUrl(sellerId)}>
        <Thumbnail2d
          type={ThumbnailTypes.avatarHeadshot}
          targetId={sellerId ?? 0}
          containerClass="avatar-headshot-md"
        />
      </a>
      <div className="resale-info">
        <div className="item-reseller-container">
          <a className="text-name username" href={getProfilePageUrl(sellerId)}>
            {resaleRecord.seller.name}
          </a>
          {!!resaleRecord.seller.hasVerifiedBadge && (
            <VerifiedBadgeIconContainer
              size={BadgeSizes.TITLE}
              overrideImgClass="verified-badge-icon-item-resellers-rendered"
              titleText={resaleRecord.seller.name}
            />
          )}
        </div>
        <span className="separator">-</span>
        <span className="font-caption-body serial-number">
          {resaleRecord.serialNumber
            ? translate("Label.SerialNumberOfTotal", {
                number: formatNumber(resaleRecord.serialNumber),
                total: formatNumber(resaleData.assetStock),
              })
            : translate("Label.SerialNotAvailable")}
        </span>
        <div className="reseller-price-container">
          <span className="icon-robux-16x16" />
          <span className="icon-robux-28x28" />
          <span className="text-robux">{formatNumber(resaleRecord.price)}</span>
          {hasDiscount && (
            <span className="reseller-original-price">
              <span className="icon-robux-16x16" />
              <span>{formatNumber(resaleRecord.discountInformation?.originalPrice)}</span>
            </span>
          )}
        </div>
      </div>
      <div
        className={classNames("reseller-buttons-container", {
          "has-trade-btn": showResellerTradeButton,
        })}
      >
        {showResellerTradeButton && isPremiumUser && (
          <div className="trade-button-container">
            {!isOwnListing && (
              <a
                className={classNames("btn-min-width", "btn-control-md", "reseller-trade-link", {
                  "fetching-trade-permissions": isFetchingTradePermissions,
                })}
                href={getUserTradeUrl(sellerId, resaleRecord.userAssetId)}
                aria-disabled={!canTradeWith}
                onClick={() => {
                  onTradeClick(resaleRecord);
                }}
              >
                {translate("Action.Trade")}
              </a>
            )}
            {isFetchingTradePermissions && <div className="spinner-circle spinner-no-margin" />}
          </div>
        )}
        {showResellerTradeButton && !isPremiumUser && (
          <div className="trade-button-container">
            <div
              className={classNames("popover", "top", "fade", "in", {
                show: activeUpgradeTradeBtnId === resaleRecord.userAssetId,
              })}
            >
              <div className="arrow" />
              <div className="popover-inner">
                <div className="popover-content">
                  <h3>
                    <span className="icon-premium-small" />
                    <span>{translate("Error.RequiresPremiumMembership")}</span>
                  </h3>
                  <p>{translate("Description.TradeBenefit")}</p>
                  <a
                    className="btn-growth-sm btn-full-width upgrade"
                    href={getUpgradeToPremiumUrl()}
                    target="_self"
                    onClick={() => {
                      onUpgradeClick(resaleRecord);
                    }}
                  >
                    {translate("Action.Upgrade")}
                  </a>
                </div>
              </div>
            </div>
            {!isOwnListing && (
              <button
                type="button"
                className="btn-min-width btn-control-md reseller-trade-link"
                onClick={() => {
                  onNonPremiumTradeClick(resaleRecord);
                }}
              >
                {translate("Action.Trade")}
              </button>
            )}
          </div>
        )}
        {!isOwnListing && !isLimited2 && (
          <button
            type="button"
            className="reseller-purchase-button btn-min-width btn-buy-md"
            data-button-type="reseller"
            data-expected-price={resaleRecord.price}
            data-expected-seller-id={sellerId}
            data-seller-name={resaleRecord.seller.name}
            data-userasset-id={resaleRecord.userAssetId}
            data-product-id={assetData.productId}
            data-item-id={assetData.id}
            data-item-name={assetData.name}
            data-asset-type={assetData.type}
            data-bc-requirement={assetData.membershipRequirement}
            data-expected-currency="1"
            onClick={() => {
              onBuy(resaleRecord);
            }}
          >
            {translate("Action.Buy")}
          </button>
        )}
        {!isOwnListing && isLimited2 && (
          <button
            type="button"
            className="reseller-purchase-button btn-min-width btn-buy-md"
            onClick={() => {
              onBuy(resaleRecord);
            }}
          >
            {translate("Action.Buy")}
          </button>
        )}
        {isOwnListing && (
          <button
            type="button"
            className="remove-sale btn-control-md btn-min-width"
            data-button-type="reseller"
            disabled={!!takeOffSaleDebounce[String(resaleRecord.userAssetId)]}
            onClick={() => {
              onTakeOffSale(resaleRecord);
            }}
          >
            {translate("Action.Remove")}
          </button>
        )}
      </div>
    </li>
  );
};

export default ResellerRow;
