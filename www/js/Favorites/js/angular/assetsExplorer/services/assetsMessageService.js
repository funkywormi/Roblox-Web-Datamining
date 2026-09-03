import assetsExplorerModule from "../assetsExplorerModule.js";
import splitStringToMultipleLines from "../utils/splitStringToMultipleLines";

function assetsMessageService(assetsConstants, languageResource) {
    "ngInject";

    return {
        getInventoryEmptyMessage: function (isOwnPage, pageType) {
            if (isOwnPage) {
                if (pageType === assetsConstants.favorites) {
                    return languageResource.get("Message.YouHaveNoFavoritesCategory");
                } else {
                    return languageResource.get("Message.YouHaveNoItemsCategory");
                }
            } else {
                if (pageType === assetsConstants.favorites) {
                    return languageResource.get("Message.UserHasNoFavoritesCategory");
                } else {
                    return languageResource.get("Message.UserHasNoItemsCategory");
                }
            }
        },

        getInventoryNewItemsMessage: function (isLibraryLinkEnabled, itemSection, linkStart, linkEnd) {
            if (isLibraryLinkEnabled) {
                if (itemSection === assetsConstants.library) {
                    return languageResource.get("Message.TryLibraryLink", { startLink: linkStart, endLink: linkEnd });
                } else if (itemSection === assetsConstants.catalog) {
                    return languageResource.get("Message.TryMarketplaceLink", { startLink: linkStart, endLink: linkEnd });
                } else {
                    return "";
                }
            } else {
                if (itemSection === assetsConstants.library) {
                    return languageResource.get("Message.TryLibraryForItems");
                } else if (itemSection === assetsConstants.catalog) {
                    return languageResource.get("Message.TryMarketplaceForItems");
                } else {
                    return "";
                }
            }
        },

        getExploreMessage: function (itemCategory, displayName) {
            // Explore message should be split into 2 lines.
            if (itemCategory === 'library') {
                var exploreMessage = languageResource.get("Message.ExploreLibraryForItems", { itemsPlural: displayName });
                return splitStringToMultipleLines.wrapStringByLines(exploreMessage, 2);
            } else {
                var exploreMessage = languageResource.get("Message.ExploreMarketplaceForItems", { itemsPlural: displayName });
                return splitStringToMultipleLines.wrapStringByLines(exploreMessage, 2);
            }
        },

        showMessageToFindNewItems: function (pageType, category, subCategory) {
            category = category || {};
            subCategory = subCategory || {};
            if (pageType === assetsConstants.types.favorites
                || subCategory.categoryType === assetsConstants.types.badge
                || subCategory.categoryType === assetsConstants.types.gamePass
                || category.categoryType === assetsConstants.types.place) {
                return false;
            }
            return true;
        }
    };
}

assetsExplorerModule.factory("assetsMessageService", assetsMessageService);
export default assetsMessageService;
