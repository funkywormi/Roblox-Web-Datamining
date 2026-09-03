import angular from "angular";
import gameBadgesModule from "../gameBadgesModule.js";

function gameBadgesListController(gameBadgesConstants, badgesLanguageService, cursorPaginationService, $filter, thumbnailConstants) {
    "ngInject";
    var ctrl = this;

    const translateBadgeFromResponse = function (badge) {
        var winRatePercentage = badge.statistics.winRatePercentage * 100;

        return {
            id: badge.id,
            name: badge.displayName || badge.name,
            description: badge.displayDescription || badge.description,
            winRatePercentage: winRatePercentage,
            awardedCount: badge.statistics.awardedCount,
            pastDayAwardedCount: badge.statistics.pastDayAwardedCount,
            rarityName: badgesLanguageService.getRarityName(winRatePercentage),
            detailsPageUrl: $filter("seoUrl")("badges", badge.id, badge.name)
        };
    };

    const shouldContinueLoadingBadges = function () {
        if (ctrl.badges.displayedBadgeCount >= ctrl.badges.data.length && ctrl.badges.pager.canLoadNextPage()) {
            ctrl.badges.pager.loadNextPage();
        }
    };

    ctrl.layout = angular.extend({}, gameBadgesConstants.layout);

    ctrl.badges = {
        displayedBadgeCount: ctrl.layout.minimumDisplayedBadgeCount,
        data: [],
        pager: cursorPaginationService.createPager({
            sortOrder: cursorPaginationService.sortOrder.Asc,
            pageSize: ctrl.layout.badgeCountPerPage,
            loadPageSize: gameBadgesConstants.badgePageLoadSize,

            getCacheKeyParameters: function () {
                return {
                    universeId: ctrl.universeId
                };
            },

            getRequestUrl: function () {
                return $filter("formatString")(gameBadgesConstants.urls.getGameBadges, { universeId: ctrl.universeId });
            },

            loadSuccess: function (items) {
                items.forEach(function (badge) {
                    if (badge.enabled) {
                        ctrl.badges.data.push(translateBadgeFromResponse(badge));
                    }
                });

                // Because the endpoint does not support filtering out disabled badges
                // we filter them out in the front end.
                // If we don't have enough badges to display the full page keep loading pages (until all badges are loaded).
                // A game can have an unbounded number of badges but they're paid for.
                // Only 150 games have more than 100 badges that could potentially make more than one page load.
                shouldContinueLoadingBadges();
            }
        })
    };

    ctrl.seeMore = function () {
        var addCount = ctrl.layout.badgeCountPerPage - (ctrl.badges.displayedBadgeCount % ctrl.layout.badgeCountPerPage);
        ctrl.badges.displayedBadgeCount += addCount;
        shouldContinueLoadingBadges();
    };

    ctrl.getRarityName = badgesLanguageService.getRarityName;
    ctrl.translateBadgeFromResponse = translateBadgeFromResponse;

    const init = function () {
        ctrl.thumbnailTypes = thumbnailConstants.thumbnailTypes;
        ctrl.badges.pager.loadFirstPage();
    };

    ctrl.$onInit = init;
}

gameBadgesModule.controller("gameBadgesListController", gameBadgesListController);
export default gameBadgesListController;
