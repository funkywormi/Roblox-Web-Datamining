import React, { useState, useCallback, useEffect } from 'react';
import { ItemDetailsHydrationService, TDetailEntry, CurrentUser } from 'Roblox';
import { Thumbnail2d, ThumbnailTypes, DefaultThumbnailSize } from 'roblox-thumbnails';
import { ItemCard } from 'react-style-guide';
import * as itemPurchase from 'roblox-item-purchase';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { groupAnnouncementsConfig } from '../translation.config';
import catalogService from '../services/catalogService';
import { logGroupPageClickEvent, logGroupPageExposureEvent } from '../../shared/utils/logging';
import { EventContext as SharedEventContext } from '../../shared/constants/eventConstants';

const { createItemPurchase } = itemPurchase;
const [ItemPurchase, itemPurchaseService] = createItemPurchase();

export type MarketplaceEmbedProps = {
  id: number;
  groupId: number;
} & WithTranslationsProps;

const MarketplaceItemEmbed = ({
  id,
  groupId,
  translate
}: MarketplaceEmbedProps): JSX.Element | null => {
  const [itemOwned, setItemOwned] = useState<boolean>(false);
  const [item, setItem] = useState<TDetailEntry | null>(null);

  const fetchItemDetails = useCallback(async () => {
    try {
      const itemDetails = await ItemDetailsHydrationService.getItemDetails(
        [{ id, itemType: 'asset' }],
        false,
        true
      );
      setItem(itemDetails[0]);

      // Hvae to query for ownership separately
      const catalogItem = await catalogService.getCatalogItemDetails('asset', id);
      setItemOwned(catalogItem.owned);
    } catch (error) {
      // Don't show the embed if this errors out
      setItem(null);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line no-void
    void fetchItemDetails();
  }, [id, fetchItemDetails]);

  if (!item) {
    return null;
  }

  const thumbnail = (
    <Thumbnail2d
      targetId={item.id}
      type={ThumbnailTypes.assetThumbnail}
      size={DefaultThumbnailSize}
    />
  );

  const purchaseInfo = item.collectibleItemDetails?.purchaseInfo || item.purchaseInfo;

  const itemPurchaseParams = {
    translate,
    productId: item.productId,
    expectedCurrency: 1,
    expectedPrice: purchaseInfo?.purchasePrice || 0,
    thumbnail,
    assetName: item.name,
    assetType: item.itemType,
    expectedSellerId: item.creatorTargetId,
    sellerName: item.creatorName,
    sellerType: item.creatorType,
    collectibleItemId: item.collectibleItemId,
    collectibleProductId: purchaseInfo?.purchaseFromReseller
      ? item.collectibleItemDetails?.lowestAvailableResaleProductId
      : item.collectibleItemDetails?.collectibleProductId,
    collectibleItemInstanceId: purchaseInfo?.purchaseFromReseller
      ? item.collectibleItemDetails?.lowestAvailableResaleItemInstanceId
      : undefined,
    onPurchaseSuccess: () => {
      logGroupPageExposureEvent({
        groupId,
        exposureType: 'marketplaceEmbedPurchaseSuccess',
        exposureId: item.id.toString(),
        context: SharedEventContext.GroupHomepage
      });
    }
  };

  const openBuyModal =
    CurrentUser.isAuthenticated &&
    purchaseInfo?.purchasable &&
    // If there is an ownership limit then only open the buy modal if it's not owned
    (!purchaseInfo?.ownershipLimit || !itemOwned);

  return (
    <React.Fragment>
      <div
        className='announcement-display-marketplace-embed'
        onClick={event => {
          logGroupPageClickEvent({
            groupId,
            clickTargetType: openBuyModal ? 'marketplaceEmbedOpenModal' : 'marketplaceEmbedLink',
            clickTargetId: item.id.toString(),
            context: SharedEventContext.GroupHomepage
          });
          if (openBuyModal) {
            event.preventDefault();
            itemPurchaseService.start();
          }
        }}
        role='button'
        tabIndex={0}>
        <ItemCard
          id={item.id}
          name={item.name}
          type={item.itemType}
          creatorName={item.creatorName}
          creatorType={item.creatorType}
          creatorTargetId={item.creatorTargetId}
          price={
            item.collectibleItemDetails?.purchaseInfo.purchasePrice ||
            item.purchaseInfo?.purchasePrice
          }
          lowestPrice={item.lowestPrice}
          unitsAvailableForConsumption={item.unitsAvailableForConsumption}
          itemStatus={item.itemStatus}
          priceStatus={item.priceStatus}
          premiumPricing={item.premiumPricing?.premiumPriceInRobux}
          itemRestrictions={item.itemRestrictions}
          thumbnail2d={thumbnail}
        />
      </div>
      <ItemPurchase {...itemPurchaseParams} />
    </React.Fragment>
  );
};
export default withTranslations(MarketplaceItemEmbed, groupAnnouncementsConfig);
