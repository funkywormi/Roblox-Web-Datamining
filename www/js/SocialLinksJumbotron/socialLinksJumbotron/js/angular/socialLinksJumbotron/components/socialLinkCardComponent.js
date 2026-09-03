import socialLinksJumbotronModule from "../socialLinksJumbotronModule";

const socialLinkCard = {
    templateUrl: "social-link-card",
    bindings: {
        "url": "<",
        "title": "<",
        "type": "<",
        "target": "<",
        "displayType": "<"
    },
    controller: "socialLinkController"
};

socialLinksJumbotronModule.component("socialLinkCard", socialLinkCard);
export default socialLinkCard;