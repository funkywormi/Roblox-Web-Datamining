import groupModule from "../groupModule";

function groupGamesController($scope, $log, groupGamesService, groupUtilityService, groupExperimentsService, $filter, groupDetailsConstants, cursorPaginationService, $q) {
    "ngInject";

    var ctrl = this;

    $scope.gamesPager = cursorPaginationService.createPager({
        displayedGames: [],

        sortOrder: cursorPaginationService.sortOrder.Desc,
        pageSize: groupDetailsConstants.gamesPageSize,
        loadPageSize: groupDetailsConstants.gamesPageLoadSize,

        getDataListFromResponse: function (response) {
            return $q(function (resolve, reject) {
                var universeIds = response.data.map(function (game) {
                    return game.id;
                });

                var finish = function () {
                    resolve(response.data.sort(function (gameA, gameB) {
                        if (gameA.playing === gameB.playing) {
                            return gameB.votes.upVotes - gameA.votes.upVotes;
                        }

                        return gameB.playing - gameA.playing;
                    }));
                };

                if (universeIds.length <= 0) {
                    finish();
                } else {
                    var gameDetailsPromise = groupGamesService.getGames(universeIds).then(function (gamesResponse) {
                        var playerCounts = {};
                        var translatedNames = {};
                        gamesResponse.data.forEach(function (game) {
                            playerCounts[game.id] = game.playing;
                            translatedNames[game.id] = game.name;
                        });

                        response.data.forEach(function (game) {
                            game.playing = playerCounts[game.id] || 0;
                            game.name = translatedNames[game.id] || game.name;
                        });
                    }, function () {
                        response.data.forEach(function (game) {
                            game.playing = 0;
                        });
                    });

                    var votesPromise = groupGamesService.getGameVotes(universeIds).then(function (votesResponse) {
                        var votes = {};
                        votesResponse.data.forEach(function (vote) {
                            votes[vote.id] = vote;
                        });

                        response.data.forEach(function (game) {
                            game.votes = votes[game.id] || {
                                upVotes: 0,
                                downVotes: 0
                            };
                        });
                    }, function () {
                        response.data.forEach(function (game) {
                            game.votes = {
                                upVotes: 0,
                                downVotes: 0
                            };
                        });
                    });

                    // If the promises fail they still fill in necessary data.
                    $q.all([gameDetailsPromise, votesPromise]).then(finish, finish);
                }
            });
        },

        getCacheKeyParameters: function () {
            return { groupId: ctrl.groupId };
        },

        getRequestUrl: function () {
            return $filter("formatString")(groupDetailsConstants.urls.groupGamesV2, { groupId: ctrl.groupId });
        },

        loadSuccess: function (games) {
            games.forEach(function (game) {
                game.gameReferralUrl = groupUtilityService.buildGameReferralUrl(game.rootPlace.id);

                var votePercentage = $filter("getPercentage")(game.votes.upVotes, game.votes.downVotes);
                game.votes.votePercentage = votePercentage === "0%" ? null : votePercentage;
            });
            $scope.games = games;
        },

        loadError: function (errors) {
            $scope.games = [];
            ctrl.layout.loadGamesError = true;
            $log.debug(" ------ getUniverses error -------");
        }
    });

    $scope.loadGroupExperiencesRedesignExperiment = async () => {
        const isEnabled = await groupExperimentsService.isGroupExperiencesRedesignExperimentEnabled();
        $scope.isGroupExperiencesRedesignEnabled = Boolean(isEnabled);
    };

    const init = function () {
        ctrl.isInitialized = true;
        ctrl.layout = {
            isLoadingExperiment: true
        };

        $scope.loadGroupExperiencesRedesignExperiment().then(() => {
            if (!$scope.isGroupExperiencesRedesignEnabled) {
                $scope.gamesPager.setPagingParameter("accessFilter", "Public");
                $scope.gamesPager.loadFirstPage();
            }
        }).catch(() => {
            ctrl.layout.loadGamesError = true
        }).finally(() => {
            ctrl.layout.isLoadingExperiment = false
        });
    };

    const onChanges = changesObj => {
        // If we haven't initialized this yet, return
        if (!ctrl.isInitialized) {
          return;
        }
    
        if ('groupId' in changesObj) {
          $scope.gamesPager.setPagingParameter('creatorTargetId', ctrl.groupId);
          $scope.gamesPager.loadNextPage();
        }
    };

    ctrl.$onInit = init;
    ctrl.$onChanges = onChanges;
}

groupModule.controller("groupGamesController", groupGamesController);
export default groupGamesController;
