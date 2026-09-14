import { EnvironmentUrls } from "@rbx/core-scripts/legacy/Roblox";

const AMP_V2_WIZARD_API_BASE = `${EnvironmentUrls.apiGatewayUrl}/amp-v2-wizard-service/v1`;

export const ENTRYPOINT_URL = `${AMP_V2_WIZARD_API_BASE}/entrypoint`;
export const CONTINUE_URL = `${AMP_V2_WIZARD_API_BASE}/continue`;

// ODP session creation lives on child-requests-api, not the wizard service.
const CHILD_REQUESTS_API_BASE = `${EnvironmentUrls.apiGatewayUrl}/child-requests-api/v1`;

export const START_ODP_SESSION_URL = `${CHILD_REQUESTS_API_BASE}/odp-requests/start-odp-session`;
