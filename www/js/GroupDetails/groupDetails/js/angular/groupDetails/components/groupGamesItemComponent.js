import groupModule from "../groupModule";

const groupGamesItem = {
    templateUrl: "group-games-item",
    bindings: {
        "game": "<"
    },
    controller: "groupGamesItemController"
};

groupModule.component("groupGamesItem", groupGamesItem);

export default groupGamesItem;
