import gameBadgesModule from "../gameBadgesModule.js";
import { Endpoints, EnvironmentUrls } from 'Roblox';

const gameBadgesConstants = {
    badgePageLoadSize: 100,

    layout: {
        minimumDisplayedBadgeCount: 3,
        badgeCountPerPage: 25
    },

    urls: {
        getGameBadges: EnvironmentUrls.badgesApi + "/v1/universes/{universeId}/badges"
    }
};

gameBadgesModule.constant("gameBadgesConstants", gameBadgesConstants);
export default gameBadgesConstants;