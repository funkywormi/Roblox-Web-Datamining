import inventoryModule from "../inventoryModule.js";

const inventoryComponent = {
    templateUrl: "inventory",
    bindings: {
        canViewInventory: "@",
    },
    controller: "inventoryContentController"
};

inventoryModule.component("inventory", inventoryComponent);
export default inventoryComponent;