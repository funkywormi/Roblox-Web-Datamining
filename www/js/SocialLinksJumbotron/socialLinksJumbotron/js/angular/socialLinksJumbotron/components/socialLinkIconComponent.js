import socialLinksJumbotronModule from "../socialLinksJumbotronModule";

const socialLinkIcon = {
    templateUrl: "social-link-icon",
    bindings: {
        "url": "<",
        "type": "<",
        "target": "<",
        "displayType": "<"
    },
    controller: "socialLinkController"
};

socialLinksJumbotronModule.component("socialLinkIcon", socialLinkIcon);
export default socialLinkIcon;