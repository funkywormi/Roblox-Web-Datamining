import socialLinksJumbotronModule from "../socialLinksJumbotronModule";

const socialLinksContainer = {
    templateUrl: "social-links-container",
    bindings: {
        "targetType": "@",
        "targetId": "<"
    },
    controller: "socialLinksContainerController"
};

socialLinksJumbotronModule.component("socialLinksContainer", socialLinksContainer);
export default socialLinksContainer;
