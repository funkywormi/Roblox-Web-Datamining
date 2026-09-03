import socialLinksConfigurationModule from "../socialLinksConfigurationModule";

const socialLinkConfigurationRow = {
    templateUrl: "social-link-configuration-row",
    bindings: {
        "socialLink": "<",
        "socialLinks": "<",
        "setFeedback": "&",
        "socialLinksMetadata": "<",
        "policies": "<",
        "v2": "<"
    },
    controller: "socialLinkConfigurationRowController"
};

socialLinksConfigurationModule.component("socialLinkConfigurationRow", socialLinkConfigurationRow);
export default socialLinkConfigurationRow;
