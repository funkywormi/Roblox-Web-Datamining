import favoritesModule from "../favoritesModule.js";

const favoritesComponent = {
    templateUrl: "favorites",
    bindings: {
        canViewInventory: "@",
    },
    controller: "favoritesContentController"
};

favoritesModule.component("favorites", favoritesComponent);
export default favoritesComponent;