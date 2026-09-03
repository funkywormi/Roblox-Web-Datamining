import React, { useCallback } from "react";
import classNames from "classnames";
import { Thumbnail2d } from "@rbx/thumbnails";
import AvatarAccoutrementService from "../../../../utils/avatarAccoutrementService";
import { useTranslation } from "@rbx/core-scripts/react";
import { Badge, Icon, Tooltip, TooltipTrigger } from "@rbx/foundation-ui";
import { OUTFIT_MENU_OPTIONS, OutfitOption } from "../../../../types";
import { OUTFIT_SETTINGS } from "../../../../constants/avatarConstants";
import {
  CatalogItem,
  CatalogOutfitItem,
  isCatalogItemAsset,
  isCatalogItemOutfit,
} from "../../../../avatar.types";
import { getLookUrl, getExpirationTimeShorthand } from "../../../../utils/assetManager.helpers";
import { isCatalogItemUnavailable } from "../../../../utils/itemAvailability";
import { useAssetManagerContext } from "../../../../contexts/AssetManagerContext";
import { useAvatarEditingAccessContext } from "../../../../contexts/AvatarEditingAccessContext";

type AvatarItemCardProps = {
  item: CatalogItem;
  isActive: boolean;
  onItemClicked: (item: CatalogItem, event: React.MouseEvent<HTMLElement>) => void;
  onItemMenuButtonClicked?: (
    event: React.MouseEvent,
    item: CatalogOutfitItem,
    option: OutfitOption,
  ) => void;
  openOutfitMenu?: (item: CatalogOutfitItem) => void;
  closeOutfitMenu?: () => void;
  onExpiredAssetsClick?: (item: CatalogOutfitItem) => void;
};

function AvatarItemCard({
  item,
  isActive,
  onItemClicked,
  onItemMenuButtonClicked,
  openOutfitMenu,
  closeOutfitMenu,
  onExpiredAssetsClick,
}: AvatarItemCardProps): JSX.Element {
  const { translate } = useTranslation();
  const isAssetTypeSelectionEnabled = useCallback((assetTypeName: string | undefined): boolean => {
    return !AvatarAccoutrementService.isEmote(assetTypeName || "");
  }, []);
  const { avatarCallLimiterItemCardsDisabled } = useAssetManagerContext();
  const { isAvatarEditingBlocked } = useAvatarEditingAccessContext();

  const isEmote =
    isCatalogItemAsset(item) && AvatarAccoutrementService.isEmote(item.assetType?.name || "");
  // Outfits whose linked Look / Bundle is moderated, suppressed, or pending
  // review surface as availabilityStatus = "Unavailable" | "PendingReview" on
  // `/v1/avatar-inventory`. Mirror the Avatars→Purchased treatment: render a
  // dark placeholder, hide the link, and no-op the click handler.
  const isUnavailable = isCatalogItemUnavailable(item);
  const isCardDisabled =
    avatarCallLimiterItemCardsDisabled || (isAvatarEditingBlocked && !isEmote) || isUnavailable;

  const getItemLink = (): string | undefined => {
    if (isUnavailable) {
      return undefined;
    }
    if (isCatalogItemAsset(item)) {
      return item.link;
    }
    if (isCatalogItemOutfit(item) && item.linkedEntityId && item.linkedEntityType === "Look") {
      return getLookUrl(String(item.linkedEntityId));
    }
    return undefined;
  };
  const itemLink = getItemLink();

  const handleItemClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isUnavailable) {
      event.preventDefault();
      return;
    }
    onItemClicked(item, event);
  };

  const expirationTimeShorthand: string = item.expirationTime
    ? getExpirationTimeShorthand(item.expirationTime, translate)
    : "";

  return (
    <div
      className={classNames("item-card-container", "remove-panel", {
        "outfit-card": item.type === "Outfit",
        "locked-card": isCardDisabled,
      })}
      aria-disabled={isCardDisabled}
    >
      <div className="item-card-link">
        <a
          href={itemLink}
          onClick={handleItemClick}
          className={classNames("item-card-thumb-container", {
            "text-secondary": isCardDisabled,
          })}
          data-item-name={item.name}
          data-availability-status={item.availabilityStatus}
        >
          <div
            className={classNames("item-card-thumb", {
              shimmer: avatarCallLimiterItemCardsDisabled,
            })}
            data-thumbnail-target-id={item.id}
            data-thumbnail-type={item.thumbnailType}
          >
            {expirationTimeShorthand && (
              <div className="expiration-time-badge">
                <Badge
                  variant="Neutral"
                  icon="icon-regular-clock"
                  className="bg-surface-0"
                  label={expirationTimeShorthand}
                />
              </div>
            )}
            {isUnavailable ? (
              // Mirrors the Thumbnail2d "Blocked" state rendering (dark grey
              // tile with the document + circle-slash icon) used elsewhere in
              // the editor when an outfit's underlying entity is moderated.
              // The item name remains visible below for context / a11y.
              <span
                className="thumbnail-2d-container icon-blocked"
                aria-hidden="true"
                data-availability-status={item.availabilityStatus}
              />
            ) : (
              <Thumbnail2d
                targetId={item.id}
                type={item.thumbnailType}
                version={item.type === "Outfit" && item.version ? String(item.version) : undefined}
                includeBackground={item.type === "Outfit"}
              />
            )}
          </div>
          {item.itemRestrictions?.itemRestrictionIcon && (
            <span
              className={classNames("restriction-icon", item.itemRestrictions.itemRestrictionIcon)}
            />
          )}
        </a>
      </div>

      <div className="item-card-caption">
        {!isUnavailable &&
          item.selected &&
          (!isCatalogItemAsset(item) || isAssetTypeSelectionEnabled(item.assetType.name)) && (
            <div className="item-card-equipped" data-item-status="equipped">
              <div className="item-card-equipped-label" />
              <span className="icon-check-selection" />
            </div>
          )}

        {item.type === "Outfit" && !isUnavailable && (
          <div
            className={classNames("item-card-menu", {
              active: isActive,
            })}
            onClick={closeOutfitMenu}
            onBlur={closeOutfitMenu}
            onKeyDown={e => e.key === "Enter" && closeOutfitMenu?.()}
            tabIndex={0}
            role="button"
          >
            {OUTFIT_MENU_OPTIONS.map(option => (
              <button
                key={option.label}
                onClick={e => onItemMenuButtonClicked?.(e, item, option)}
                type="button"
                className="btn-secondary-xs"
              >
                {translate(option.label)}
              </button>
            ))}
          </div>
        )}

        <a href={itemLink} onClick={handleItemClick} className="item-card-name-link">
          <div title={item.name} className="text-overflow item-card-name">
            {item.name}
          </div>
        </a>
        {item.type === "Outfit" &&
          !isUnavailable &&
          item.expiredAssets &&
          item.expiredAssets.length > 0 && (
            <span
              className="expired-assets-icon-container"
              onClick={() => onExpiredAssetsClick?.(item)}
              onKeyDown={e => e.key === "Enter" && onExpiredAssetsClick?.(item)}
              tabIndex={0}
              role="button"
            >
              <Tooltip position="top-center" title="View expired items">
                <TooltipTrigger asChild>
                  <Icon name="icon-regular-circle-i" size="Small" />
                </TooltipTrigger>
              </Tooltip>
            </span>
          )}

        {item.type === "Outfit" &&
          !isUnavailable &&
          item.isEditable &&
          OUTFIT_SETTINGS[item.outfitType] &&
          item.outfitType !== "Makeup" && (
            <span
              onClick={() => openOutfitMenu?.(item)}
              onKeyDown={e => e.key === "Enter" && openOutfitMenu?.(item)}
              tabIndex={0}
              role="button"
              aria-label={translate("Action.EditOutfit")}
              className="icon-settings-16x16 edit-outfit"
              data-item-name={item.name}
            />
          )}
      </div>
    </div>
  );
}

export default AvatarItemCard;
