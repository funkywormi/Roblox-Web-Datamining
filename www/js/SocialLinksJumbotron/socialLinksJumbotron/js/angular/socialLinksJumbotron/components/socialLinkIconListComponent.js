import socialLinksJumbotronModule from "../socialLinksJumbotronModule";

const socialLinkIconList = {
    templateUrl: "social-link-icon-list",
    bindings: {
        "targetType": "@",
        "targetId": "<"
    },
    controller: "socialLinkIconListController"
};

socialLinksJumbotronModule.component("socialLinkIconList", socialLinkIconList);
export default socialLinkIconList;