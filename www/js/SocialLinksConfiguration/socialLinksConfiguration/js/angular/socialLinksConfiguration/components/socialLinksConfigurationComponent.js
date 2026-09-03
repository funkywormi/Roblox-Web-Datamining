import socialLinksConfigurationModule from "../socialLinksConfigurationModule";

const socialLinksConfiguration = {
    templateUrl: "social-links-configuration",
    bindings: {
        "targetType": "@",
        "targetId": "<",
        "socialLinkLimit": "@",
        "v2": "<?",
        policies: '<'
    },
    controller: "socialLinksConfigurationController"
};

socialLinksConfigurationModule.component("socialLinksConfiguration", socialLinksConfiguration);
export default socialLinksConfiguration;