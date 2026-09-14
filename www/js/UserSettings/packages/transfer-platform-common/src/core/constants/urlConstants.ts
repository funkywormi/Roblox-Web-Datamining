import environmentUrls from "@rbx/environment-urls";

const { apiGatewayUrl } = environmentUrls;

/** The signed-in child's own parental-consent requests. */
export const consentsUrl = `${apiGatewayUrl}/parental-controls-api/v1/parental-controls/consents`;

export const cancelConsentRequestUrl = `${apiGatewayUrl}/child-requests-api/v1/cancel-consent-request`;

/** Evaluates one AMP feature for the signed-in user. */
export const featureAccessUrl = `${apiGatewayUrl}/access-management/v1/upsell-feature-access`;
