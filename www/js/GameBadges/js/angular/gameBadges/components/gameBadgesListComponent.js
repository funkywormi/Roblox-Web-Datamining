import gameBadgesModule from "../gameBadgesModule.js";

const gameBadgesListComponent = {
    templateUrl: "game-badges-list",
    bindings: {
        "universeId": "<"
    },
    controller: "gameBadgesListController"
};

gameBadgesModule.component("gameBadgesList", gameBadgesListComponent);
export default gameBadgesListComponent;