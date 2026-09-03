/* eslint-disable react/no-danger */
/* eslint-disable react/jsx-no-literals */
import React, { useMemo, useCallback, useState, ReactChildren } from 'react';
import { Tooltip } from 'react-style-guide';
import { Linkify, Intl, AvatarAccoutrementService, EnvironmentUrls } from 'Roblox';
import {
  TAssetItemDetails,
  TBundleItemDetails,
  TUserItemPermissions,
  TOwnedItemInstance,
  TResellerItem,
  TCollectibleResellerItem
} from '../constants/types';
import { useCategoryTranslation } from '../utils/hooks';
import translationResources, {
  itemTranslations,
  catalogTranslations
} from '../services/translationService';
import ItemPriceContainer from './ItemPriceContainer';
import {
  isCollectible,
  isInExperienceOnly,
  isLimited,
  isLimitedUnique,
  checkReachedQuantityLimit
} from '../utils/itemDetailUtils';
import { ResaleRestriction } from '../constants/resaleRestrictionConstants';
import {
  l1ResaleHoldingPolicyDays,
  l2PurchaseHoldingPolicyDays,
  l2ResaleHoldingPolicyDays
} from '../constants/holdingPolicyConstants';
import ExperienceLinks from './ExperienceLinks';
import {
  bundleSlotTranslations,
  groupBundleSlotTranslations
} from '../constants/categoryTranslations';
import {
  isSupportedRenderProperty,
  renderPropertyTranslations
} from '../constants/renderPropertyConstants';

export type TItemDetailsInfoBodyProps = {
  itemDetails: TAssetItemDetails | TBundleItemDetails;
  tags: Array<string>;
  permissions: TUserItemPermissions;
  ownedItemInstances: TOwnedItemInstance[];
  resellers: TResellerItem[] | TCollectibleResellerItem[] | null;
  reachedQuantityLimit?: boolean;
  originalItemDetails?: boolean;
  collectibleItemDetails?: TAssetItemDetails | TBundleItemDetails;
  faeFeatureGranted?: boolean;
  faeUpsellGranted?: boolean;
};

export type TItemPriceContainerProps = {
  itemDetails: TAssetItemDetails | TBundleItemDetails;
  tags: Array<string>;
  permissions: TUserItemPermissions;
  ownedItemInstances: TOwnedItemInstance[];
  resellers: TResellerItem[] | TCollectibleResellerItem[] | null;
  reachedQuantityLimit?: boolean;
  originalItemDetails?: boolean;
  collectibleItemDetails?: TAssetItemDetails | TBundleItemDetails;
  purchaseButtonLoaded: boolean;
  faeFeatureGranted?: boolean;
  faeUpsellGranted?: boolean;
};

type TRenderDescLinkProps = {
  attributes: { href: string };
  content: ReactChildren;
};

type TLinkifyOptions = {
  render: (TRenderDescLinkProps) => JSX.Element;
};

const DescriptionLink = ({ attributes, content }: TRenderDescLinkProps) => {
  return (
    <a className='text-link' href={attributes.href} target='_blank' rel='noreferrer'>
      {content}
    </a>
  );
};

type TDescriptionTextProps = {
  description: string;
};

type StringWithEscapeHTML = string & { escapeHTML: () => string };
const intl = new Intl();

function ItemDescription({ description }: TDescriptionTextProps): JSX.Element {
  const [descriptionHasReadMore, setDescriptionHasReadMore] = useState(false);
  const [descriptionTruncationExpanded, setDescriptionTruncationExpanded] = useState(false);

  const descriptionRef = useCallback((elm: HTMLParagraphElement) => {
    if (!elm) return;
    if (elm.offsetHeight > 98) {
      setDescriptionHasReadMore(true);
    }
  }, []);

  const descriptionClass = useMemo(() => {
    const classes = [
      'font-body text description-content wait-for-i18n-format-render content-overflow-toggle'
    ];
    if (descriptionHasReadMore) {
      if (descriptionTruncationExpanded) {
        classes.push('content-overflow-toggle-off');
      } else {
        classes.push('content-height');
      }
    }
    return classes.join(' ');
  }, [descriptionHasReadMore, descriptionTruncationExpanded]);

  const getDescription = () => {
    if (Linkify !== undefined) {
      return Linkify.String((description as StringWithEscapeHTML).escapeHTML());
    }
    return '';
  };

  return (
    <div className='clearfix toggle-target item-info-row-container'>
      <div className='font-header-1 text-subheader text-label text-overflow row-label'>
        {catalogTranslations.labelDescription()}
      </div>
      <div className='row-content'>
        <p id='item-details-description' className={descriptionClass} ref={descriptionRef}>
          <div dangerouslySetInnerHTML={{ __html: getDescription() }} />
        </p>
        {!!descriptionHasReadMore && (
          <button
            className='row-content toggle-description text-link cursor-pointer'
            data-container-id='item-details-description'
            data-show-label='Read More'
            data-hide-label='Show Less'
            type='button'
            onClick={() => {
              setDescriptionTruncationExpanded(!descriptionTruncationExpanded);
            }}>
            {descriptionTruncationExpanded
              ? itemTranslations.labelShowLess()
              : itemTranslations.labelReadMore()}
          </button>
        )}
      </div>
    </div>
  );
}

export const ItemDetailsInfoBody = (
  props: TItemDetailsInfoBodyProps & { purchaseButtonLoaded: boolean }
): JSX.Element | null => {
  const {
    itemDetails,
    tags,
    permissions,
    ownedItemInstances,
    resellers,
    collectibleItemDetails,
    purchaseButtonLoaded,
    faeFeatureGranted,
    faeUpsellGranted
  } = props;
  const dateTimeFormatter = intl.getDateTimeFormatter();

  const resaleRestriction = collectibleItemDetails
    ? collectibleItemDetails.resaleRestriction
    : ResaleRestriction.NONE;

  const assetOrBundleType =
    itemDetails?.itemType === 'Bundle' ? itemDetails?.bundleType : itemDetails?.assetType;

  const categoryValueTranslations = useCategoryTranslation(itemDetails.itemType, assetOrBundleType);

  const isLimitedU = isLimitedUnique(itemDetails.itemRestrictions);
  const isLimited1 = isLimited(itemDetails.itemRestrictions);
  const isLimited2 = isCollectible(itemDetails.itemRestrictions);
  const isLimited2AndOffSale = isLimited2 && itemDetails.isOffSale === true;
  const isItemLimited = isLimited1 || isLimited2;
  // LimitedU still on sale needs special treatment for not showing holding tooltip
  const isItemLimitedUOnsale = isLimitedU && !!itemDetails.unitsAvailableForConsumption;
  const isOnlyInExperience = itemDetails.saleLocationType === 'ExperiencesDevApiOnly';
  const isIEPWithHyperLinks = isOnlyInExperience && !!collectibleItemDetails?.experiences?.length;
  // Backend may send render properties this client has no copy for yet.
  const renderProperties = useMemo(
    () => (itemDetails.renderProperties ?? []).filter(isSupportedRenderProperty),
    [itemDetails.renderProperties]
  );

  // supportsHeadShapes is true if any bundled item has supportsHeadShapes
  const supportsHeadShapes =
    itemDetails.itemType === 'Bundle' &&
    itemDetails.bundledItems?.some(bundledItem => bundledItem.supportsHeadShapes === true);

  // Render original copy information like quantity and original price separately from reseller copy info
  // And we exclude in-experience sale for now because original copy can only be bought in-experience
  // And we exclude L2.0 + offsale items because original copies won't be purchasable
  const shouldSeparateDetails =
    isLimited2 &&
    !!itemDetails.hasResellers &&
    resaleRestriction !== ResaleRestriction.DISABLED &&
    (!isInExperienceOnly(itemDetails) || isIEPWithHyperLinks) &&
    !isLimited2AndOffSale;

  // Treat original copy as non-purchasable if quantity limit is reached
  const reachedQuantityLimit = checkReachedQuantityLimit(itemDetails, ownedItemInstances);
  const reachedQuantityLimitWithoutReseller = reachedQuantityLimit && !itemDetails.hasResellers;

  // Whether the item has a holding period after purchase
  const hasHoldingPeriod = isItemLimited;

  const placement = useMemo(() => {
    if (itemDetails.itemType === 'Asset') {
      const assetTypeSlot = AvatarAccoutrementService.getAssetTypeById(itemDetails.assetType)?.slot;
      const slot = assetTypeSlot?.catalogNameKey;
      const group = assetTypeSlot?.groupCatalogNameKey;
      if (!slot) {
        return '';
      }
      if (slot && group) {
        return `${translationResources.featureCatalog.get(
          group,
          {}
        )} | ${translationResources.featureCatalog.get(slot, {})}`;
      }
    } else {
      const slot = bundleSlotTranslations[itemDetails.bundleType];
      const group = groupBundleSlotTranslations[itemDetails.bundleType];
      if (slot && group && group !== '') {
        return `${translationResources.featureCatalog.get(
          group,
          {}
        )} | ${translationResources.featureCatalog.get(slot, {})}`;
      }
      if (slot) {
        return translationResources.featureCatalog.get(slot, {});
      }
    }
    return categoryValueTranslations?.categoryString || '';
  }, [itemDetails, categoryValueTranslations]);

  return (
    // selenium tests use "item-details" id to find the purchase button inside the item details section
    // https://sourcegraph.rbx.com/github.rbx.com/Roblox/web-platform@1e48226ae6c032c21a88cc020639d2e7f1cf2075/-/blob/Assemblies/Selenium/Roblox.Selenium.Framework/Pages/Web/Item/ItemPage.cs?L72&subtree=true#tab=def
    <div id='item-details' className='item-details-section'>
      {shouldSeparateDetails && !reachedQuantityLimitWithoutReseller && (
        <ItemPriceContainer
          itemDetails={itemDetails}
          tags={tags}
          permissions={permissions}
          ownedItemInstances={ownedItemInstances}
          resellers={resellers}
          reachedQuantityLimit={reachedQuantityLimit}
          originalItemDetails
          collectibleItemDetails={collectibleItemDetails}
          purchaseButtonLoaded={purchaseButtonLoaded}
          faeFeatureGranted={faeFeatureGranted}
          faeUpsellGranted={faeUpsellGranted}
        />
      )}
      {isOnlyInExperience && !!itemDetails.hasResellers && !!collectibleItemDetails && (
        <ExperienceLinks
          collectibleItemDetails={collectibleItemDetails}
          itemType={itemDetails.itemType}
        />
      )}
      <ItemPriceContainer
        itemDetails={itemDetails}
        tags={tags}
        permissions={permissions}
        ownedItemInstances={ownedItemInstances}
        resellers={resellers}
        reachedQuantityLimit={reachedQuantityLimit}
        originalItemDetails={false}
        collectibleItemDetails={collectibleItemDetails}
        purchaseButtonLoaded={purchaseButtonLoaded}
        faeFeatureGranted={faeFeatureGranted}
        faeUpsellGranted={faeUpsellGranted}
      />

      {isOnlyInExperience && !itemDetails.hasResellers && !!collectibleItemDetails && (
        <ExperienceLinks
          collectibleItemDetails={collectibleItemDetails}
          itemType={itemDetails.itemType}
        />
      )}
      <div className='clearfix item-info-row-container'>
        <div className='font-header-1 text-subheader text-label text-overflow row-label'>
          {catalogTranslations.labelTradable()}
        </div>
        <span id='tradable-content' className='font-body text wait-for-i18n-format-render'>
          {isLimited1 ? itemTranslations.actionYes() : itemTranslations.actionNo()}
        </span>
      </div>
      {resaleRestriction !== ResaleRestriction.DISABLED && isItemLimited && !isItemLimitedUOnsale && (
        <div className='clearfix item-info-row-container'>
          <div className='font-header-1 text-subheader text-label text-overflow row-label'>
            <Tooltip
              placement='right'
              id='hold-tooltip'
              content={
                <div className='holding-tooltip-body'>
                  <div className='font-caption-header holding-tooltip-body-header'>
                    {catalogTranslations.headingHoldingPolicy()}
                  </div>
                  <div className='font-caption-body text holding-tooltip-body-text'>
                    {
                      // eslint-disable-next-line no-nested-ternary
                      hasHoldingPeriod
                        ? isLimited1
                          ? catalogTranslations.messageHoldingPolicyL1(l1ResaleHoldingPolicyDays)
                          : catalogTranslations.messageHoldingPolicyL2(
                              l2PurchaseHoldingPolicyDays,
                              l2ResaleHoldingPolicyDays
                            )
                        : catalogTranslations.messageNoHoldingPolicy()
                    }
                  </div>
                </div>
              }
              containerClassName='item-details-info-tooltip-container'>
              <span className='item-hold-tooltip'>
                <span className='font-body text'>{catalogTranslations.labelHoldingPeriod()}</span>
                <span className='icon-actions-info-sm item-hold-icon' />
              </span>
            </Tooltip>
          </div>

          <span className='item-hold-tooltip'>
            <span className='font-body text'>
              {hasHoldingPeriod ? itemTranslations.actionYes() : itemTranslations.actionNo()}
            </span>
          </span>
        </div>
      )}
      {resaleRestriction === ResaleRestriction.DISABLED && isItemLimited && !isItemLimitedUOnsale && (
        <div className='clearfix item-info-row-container'>
          <div className='font-header-1 text-subheader text-label text-overflow row-label'>
            <Tooltip
              placement='right'
              id='hold-tooltip'
              content={
                <div className='holding-tooltip-body'>
                  <div className='font-caption-body text resellable-tooltip-body-text'>
                    {catalogTranslations.messageCannotResell()}
                  </div>
                </div>
              }
              containerClassName='item-details-info-tooltip-container'>
              <span className='item-hold-tooltip'>
                <span className='font-body text'>{catalogTranslations.labelResellable()}</span>
                <span className='icon-actions-info-sm item-hold-icon' />
              </span>
            </Tooltip>
          </div>
          <span className='item-hold-tooltip'>
            <span className='font-body text'>{itemTranslations.actionNo()}</span>
          </span>
        </div>
      )}

      {/* (
        <div className='clearfix item-info-row-container'>
          <div className='font-header-1 text-subheader text-label text-overflow row-label'>
            {catalogTranslations.labelSalesType()}
          </div>
          <div className='font-body text row-content row-text-content'>
            {catalogTranslations.labelCollectibles()}
            <Tooltip
              id='collectible-info-tooltip'
              placement='right'
              content={
                <div className='collectible-tootltip-inner font-caption-body text'>
                  <div className='tooltip-header font-caption-body text'>
                    {catalogTranslations.labelNewCollectibles()}
                  </div>
                  <div className='tooltip-body font-caption-body text'>
                    {catalogTranslations.messageCollectiblesInfo()}
                  </div>
                </div>
              }>
              <span className='icon-actions-info-sm' />
            </Tooltip>
          </div>
        </div>
      ) */}

      {/* !!tags?.length && (
        <div className='clearfix item-field-container item-info-row-container'>
          <div className='text-label text-overflow row-label'>
            {catalogTranslations.labelTags()}
          </div>
          <div className='row-content'>
            <span className='pills-container'>
              {tags.map(t => (
                <span className='pill font-caption-body text' key={t}>
                  {t}
                </span>
              ))}
            </span>
          </div>
        </div>
      ) */}
      {(!!itemDetails.taxonomy?.[0]?.taxonomyName ||
        !!categoryValueTranslations?.categoryString) && (
        <div className='clearfix item-info-row-container'>
          <div className='font-header-1 text-subheader text-label text-overflow row-label'>
            <Tooltip
              placement='right'
              id='category-type-tooltip'
              content={
                <div className='holding-tooltip-body'>
                  <div className='font-caption-body text resellable-tooltip-body-text'>
                    {catalogTranslations.messagePriceCouldBeDifferent()}
                  </div>
                </div>
              }
              containerClassName='item-details-info-tooltip-container'>
              <span className='item-hold-tooltip'>
                <span className='font-body text'>{catalogTranslations.labelCategoryType()}</span>
                <span className='icon-actions-info-sm item-hold-icon' />
              </span>
            </Tooltip>
          </div>
          <span id='type-content' className='font-body text wait-for-i18n-format-render'>
            {itemDetails.taxonomy?.[0]?.taxonomyName ?? categoryValueTranslations?.categoryString}
          </span>
        </div>
      )}
      {placement !== '' && !!categoryValueTranslations?.categoryString && (
        <div className='clearfix item-info-row-container'>
          <div className='font-header-1 text-subheader text-label text-overflow row-label'>
            {catalogTranslations.labelPlacement()}
          </div>
          <span id='type-content' className='font-body text wait-for-i18n-format-render'>
            {placement}
          </span>
        </div>
      )}
      {renderProperties.length > 0 && (
        <div className='clearfix item-info-row-container'>
          <div className='font-header-1 text-subheader text-label text-overflow row-label'>
            <Tooltip
              placement='right'
              id='attributes-tooltip'
              content={
                <div className='holding-tooltip-body attributes-tooltip-body'>
                  {renderProperties.map(renderProperty => (
                    <div key={renderProperty} className='attributes-tooltip-section'>
                      <div className='font-caption-header holding-tooltip-body-header'>
                        {renderPropertyTranslations[renderProperty].label()}
                      </div>
                      <div className='font-caption-body text resellable-tooltip-body-text'>
                        {renderPropertyTranslations[renderProperty].info()}
                      </div>
                    </div>
                  ))}
                </div>
              }
              containerClassName='item-details-info-tooltip-container'>
              <span className='item-hold-tooltip'>
                <span className='font-body text'>{catalogTranslations.labelAttributes()}</span>
                <span className='icon-actions-info-sm item-hold-icon' />
              </span>
            </Tooltip>
          </div>
          <span className='item-hold-tooltip'>
            <span className='font-body text'>
              {renderProperties
                .map(renderProperty => renderPropertyTranslations[renderProperty].label())
                .join(', ')}
            </span>
          </span>
        </div>
      )}
      {supportsHeadShapes && (
        <div className='clearfix item-info-row-container'>
          <div className='font-header-1 text-subheader text-label text-overflow row-label'>
            {catalogTranslations.labelHeadShape()}
          </div>
          <span id='tradable-content' className='font-body text wait-for-i18n-format-render'>
            {catalogTranslations.labelAdjustable()}
          </span>
        </div>
      )}
      {itemDetails.itemCreatedUtc && (
        <div className='clearfix item-info-row-container'>
          <div className='font-header-1 text-subheader text-label text-overflow row-label'>
            {catalogTranslations.labelCreated()}
          </div>
          <span id='tradable-content' className='font-body text wait-for-i18n-format-render'>
            {dateTimeFormatter.getCustomDateTime(itemDetails.itemCreatedUtc, {
              year: 'numeric',
              month: 'short',
              day: '2-digit'
            })}
          </span>
        </div>
      )}
      {itemDetails.rootPlaceId && itemDetails.universeName && (
        <div className='clearfix item-info-row-container' style={{ alignItems: 'center' }}>
          <div className='font-header-1 text-subheader text-label text-overflow row-label'>
            {catalogTranslations.labelAttribution()}
          </div>
          <a
            className='text-link font-body text'
            href={`${EnvironmentUrls.websiteUrl}/games/${itemDetails.rootPlaceId}`}>
            {itemDetails.universeName}
          </a>
        </div>
      )}

      {!!itemDetails?.description?.trim() && (
        <ItemDescription description={itemDetails.description} />
      )}
    </div>
  );
};
export default ItemDetailsInfoBody;
