import groupModule from '../groupModule';

function groupGamesService(groupDetailsConstants, httpService, $filter) {
    "ngInject";

    return {
        getGames: function (universeIds) {
            var config = {
                url: $filter("formatString")(groupDetailsConstants.urls.games)
            };
            return httpService.httpGet(config, { universeIds: universeIds.join(",") });
        },

        getGameVotes: function (universeIds) {
            var config = {
                url: groupDetailsConstants.urls.gameVotes
            };
            return httpService.httpGet(config, { universeIds: universeIds.join(",") });
        }
    };
}

groupModule.factory("groupGamesService", groupGamesService);
export default groupGamesService;
