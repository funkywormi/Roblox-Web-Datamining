import { useCallback, useEffect, useMemo, type FocusEvent, type JSX } from "react";
import { ItemCard, ShoppingCardProps } from "react-style-guide";
import { BadgeSizes, VerifiedBadgeIconContainer } from "roblox-badges";
import { document as browserDocument } from "@rbx/core-lib/browser";
import { TTimedOption } from "../../../../itemDetailsHydrationService/constants/itemDetailsHydrationConstants";
import { ItemWithDetails } from "../../../constants/types";
import { trackItemCardClick, TItemCardSource } from "../../../../analytics/axTrackingEvents";
import {
  ANIMATION_HOVER_INTENT_MS,
  canPreviewAnimationOnHover,
  getAnimationPreviewEntries,
  isAnimationItemCard,
} from "../../../utils/animationItemUtils";
import {
  claimAnimationPreview,
  useIsActiveAnimationPreview,
} from "../../../utils/animationPreviewCoordinator";
import useAnimationItemCardHoverPreviewIxp from "../../../hooks/useAnimationItemCardHoverPreviewIxp";
import useHoverIntent from "../../../hooks/useHoverIntent";
import usePrefersReducedMotion from "../../../hooks/usePrefersReducedMotion";
import { processTimedOptionsForCart } from "../../../../shoppingCart/utils/cartUtils";
import CatalogItemCardThumbnail from "./CatalogItemCardThumbnail";

type ItemWithTimedOptions = ItemWithDetails & {
  timedOptions?: TTimedOption[];
};

export type CatalogItemCardProps = {
  item: ItemWithDetails;
  shoppingCartProps: ShoppingCardProps;
  enableThumbnailPrice?: boolean;
  enableCatalogRevampExperiment?: boolean;
};

function CatalogItemCard({
  item,
  shoppingCartProps,
  enableThumbnailPrice,
  enableCatalogRevampExperiment,
}: CatalogItemCardProps): JSX.Element {
  const itemKey = `${item.itemType}_${item.id}`;
  const animationEntries = useMemo(() => getAnimationPreviewEntries(item), [item]);
  const reducedMotion = usePrefersReducedMotion();
  const isHoverPreviewIxpEnabled = useAnimationItemCardHoverPreviewIxp();
  const isAnimationCard = isAnimationItemCard(item);
  // Attach hover handlers once IXP allows animation cards — even before pack members hydrate —
  // so settling under the cursor still starts a preview.
  const hoverHandlersEnabled = isHoverPreviewIxpEnabled && isAnimationCard && !reducedMotion;
  const canPreviewAnimation = hoverHandlersEnabled && canPreviewAnimationOnHover(item);
  const { isHovered, onHoverStart, onHoverEnd } = useHoverIntent({
    delayMs: ANIMATION_HOVER_INTENT_MS,
    enabled: hoverHandlersEnabled,
  });
  const isActivePreview = useIsActiveAnimationPreview(itemKey);

  useEffect(() => {
    if (!isHovered || !canPreviewAnimation) {
      return undefined;
    }
    return claimAnimationPreview(itemKey);
  }, [isHovered, canPreviewAnimation, itemKey]);

  // If IXP / pack hydration flips on while the pointer is already over the thumb, mouseenter
  // will not re-fire — kick intent from the current :hover state.
  useEffect(() => {
    if (!canPreviewAnimation || isHovered || browserDocument == null) {
      return;
    }
    const previewEl = browserDocument.querySelector(`[data-animation-preview-key="${itemKey}"]`);
    if (
      previewEl != null &&
      "matches" in previewEl &&
      typeof previewEl.matches === "function" &&
      previewEl.matches(":hover")
    ) {
      onHoverStart();
    }
  }, [canPreviewAnimation, isHovered, itemKey, onHoverStart]);

  const onFocusOut = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        onHoverEnd();
      }
    },
    [onHoverEnd],
  );

  const itemWithTimedOptions = item as ItemWithTimedOptions;
  const processedTimedOptions = processTimedOptionsForCart(
    itemWithTimedOptions.timedOptions,
    item.price ?? 0,
  );
  const selectedTimedOption = processedTimedOptions?.find(option => option.selected);
  const { price, lowestPrice } = selectedTimedOption
    ? { price: selectedTimedOption.price, lowestPrice: selectedTimedOption.price }
    : item;

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      key={itemKey}
      style={{ display: "contents" }}
      onClick={() =>
        trackItemCardClick(TItemCardSource.Catalog, {
          itemId: item.id,
          itemType: item.itemType,
          animatedItemCardEnabled: isHoverPreviewIxpEnabled,
        })
      }
      onMouseEnter={hoverHandlersEnabled ? onHoverStart : undefined}
      onMouseLeave={hoverHandlersEnabled ? onHoverEnd : undefined}
      onFocus={hoverHandlersEnabled ? onHoverStart : undefined}
      onBlur={hoverHandlersEnabled ? onFocusOut : undefined}
    >
      <ItemCard
        key={itemKey}
        id={item.id}
        name={item.name}
        type={item.itemType}
        creatorName={item.creatorName}
        creatorType={item.creatorType}
        creatorTargetId={item.creatorTargetId}
        price={price}
        lowestPrice={lowestPrice}
        unitsAvailableForConsumption={item.unitsAvailableForConsumption}
        itemStatus={item.itemStatus}
        priceStatus={item.priceStatus}
        premiumPricing={item.premiumPricing?.premiumPriceInRobux}
        itemRestrictions={item.itemRestrictions}
        thumbnail2d={
          <CatalogItemCardThumbnail
            itemId={item.id}
            itemType={item.itemType}
            playAnimation={isHovered && canPreviewAnimation && isActivePreview}
            animationEntries={animationEntries}
            enableCatalogRevampExperiment={enableCatalogRevampExperiment}
            previewKey={itemKey}
          />
        }
        iconToRender={
          item.creatorHasVerifiedBadge ? (
            <VerifiedBadgeIconContainer
              overrideImgClass="verified-badge-icon-catalog-item-rendered"
              size={BadgeSizes.TITLE}
              titleText={item.creatorTargetId.toString()}
            />
          ) : undefined
        }
        shoppingCartProps={shoppingCartProps}
        containerClassName={enableCatalogRevampExperiment ? "catalog-item-container" : undefined}
        enableThumbnailPrice={enableThumbnailPrice}
        timedOptions={processedTimedOptions}
        licenseType={item.license?.licenseType}
      />
    </div>
  );
}

export default CatalogItemCard;
