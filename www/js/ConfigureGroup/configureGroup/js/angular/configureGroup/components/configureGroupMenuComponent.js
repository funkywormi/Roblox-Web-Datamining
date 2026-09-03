import configureGroupModule from '../configureGroupModule';

const configureGroupMenu = {
    templateUrl: "configure-group-menu",
    bindings: {
        "menuOptions": "<",
        "currentMenuOption": "<",
        "currentSubmenuOption": "<"
    },
    controller: "configureGroupMenuController"
};

configureGroupModule.component("configureGroupMenu", configureGroupMenu);

export default configureGroupMenu;