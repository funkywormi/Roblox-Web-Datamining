import { seoName } from 'core-utilities';
import { EnvironmentUrls, Endpoints } from 'Roblox';
import { ItemCardUtils } from 'react-style-guide';
import assetsExplorerModule from '../assetsExplorerModule';

function itemCardUtility($filter, assetsConstants) {
  'ngInject';

  return {
    mapCatalogDetailsToInventoryItemCard(item, itemDetail) {
      this.buildUserLink(itemDetail);
      this.mapItemRestrictionIcons(itemDetail);
      const parsedItem = {
        AssetRestrictionIcon: {
          cssTag: ''
        },
        itemRestrictionIcon: itemDetail.itemRestrictionIcon,
        Creator: {
          CreatorProfileLink: itemDetail.creatorLink,
          nameForDisplay: itemDetail.creatorName
        },
        Item: {
          Name: itemDetail.name,
          AbsoluteUrl: this.buildItemDetailsUrl(
            itemDetail,
            item.itemType
          ) /* ,
          AudioUrl: '' */
        },
        /*
        PrivateServer: {
          OwnerProfileLink: '',
          nameForDisplay: ''
        },
        */
        Product: {
          SerialNumber: item.serialNumber,
          IsFree: itemDetail.price === 0,
          PremiumPriceInRobux: itemDetail.premiumPricing
            ? itemDetail.premiumPricing.premiumPriceInRobux
            : undefined,
          PriceInRobux: itemDetail.lowestPrice ? itemDetail.lowestPrice : itemDetail.price
        },
        UserItem: {},
        itemV2: {
          thumbnail: {
            type: item.itemType === 'Bundle' ? 'BundleThumbnail' : 'Asset'
          },
          id: itemDetail.id,
          type: item.itemType.toLowerCase()
        },
        priceStatus: itemDetail.priceStatus,
        itemDetailsLoading: false
      };
      return parsedItem;
    },
    mapItemRestrictionIcons(item) {
      if (item && item.itemRestrictions) {
        Object.assign(
          item,
          ItemCardUtils.mapItemRestrictionIcons(item.itemRestrictions, item.itemType)
        );
      }
    },
    buildItemDetailsUrl(item, itemType) {
      const { id, name } = item;
      const { itemTypes } = assetsConstants;

      if (itemType === 'Bundle') {
        return Endpoints.getAbsoluteUrl
          ? Endpoints.getAbsoluteUrl(`/bundles/${id}/${seoName.formatSeoName(name)}`)
          : `${EnvironmentUrls.websiteUrl}/bundles/${id}/${seoName.formatSeoName(name)}`;
      }
      return Endpoints.getAbsoluteUrl
        ? Endpoints.getAbsoluteUrl(`/catalog/${id}/${seoName.formatSeoName(name)}`)
        : `${EnvironmentUrls.websiteUrl}/catalog/${id}/${seoName.formatSeoName(name)}`;
    },
    buildUserLink(item) {
      const { creatorType, creatorTargetId } = item || {};
      const { userTypesString } = assetsConstants;
      switch (creatorType) {
        case userTypesString.group:
          item.creatorLink = Endpoints.getAbsoluteUrl(`/groups/${creatorTargetId}`);
          break;
        case userTypesString.user:
        default:
          item.creatorLink = Endpoints.getAbsoluteUrl(`/users/${creatorTargetId}/profile`);
          break;
      }
    }
  };
}

assetsExplorerModule.factory('itemCardUtility', itemCardUtility);

export default itemCardUtility;
