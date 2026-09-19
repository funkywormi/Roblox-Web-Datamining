import EnvironmentUrls from "@rbx/environment-urls";

export type APIMethod =
  | "fetchMetadata"
  | "fetchLogin"
  | "fetchAccountSettingsLegacy"
  | "fetchAccountSettingsV1"
  | "validateUsername"
  | "fetchChatConfigPayload"
  | "fetchC3ChatConfigPayload";
export type APISet = { url: string; retryable: boolean; withCredentials: boolean };
export type APISets = Record<APIMethod, APISet>;

export const apiSet: APISets = {
  fetchMetadata: {
    url: "/support/metadata",
    retryable: true,
    withCredentials: false,
  },
  fetchLogin: {
    url: "/login",
    retryable: true,
    withCredentials: true,
  },
  fetchAccountSettingsLegacy: {
    url: "/my/settings/json",
    retryable: true,
    withCredentials: false,
  },
  fetchAccountSettingsV1: {
    url: `${EnvironmentUrls.apiGatewayUrl}/user-settings-api/v1/user-settings`,
    retryable: true,
    withCredentials: true,
  },
  validateUsername: {
    url: `${EnvironmentUrls.authApi}/v1/usernames/validate`,
    retryable: true,
    // Staying unauthenticated keeps auth-api on its age-bracket code path. The authenticated
    // path reports a username the caller already owns as free, which would read as "no such
    // account" for anyone asking about their own.
    withCredentials: false,
  },
  fetchChatConfigPayload: {
    url: `${EnvironmentUrls.apiGatewayUrl}/sierra-service/v1/chat-config-payload`,
    retryable: true,
    withCredentials: false,
  },
  fetchC3ChatConfigPayload: {
    url: `${EnvironmentUrls.apiGatewayUrl}/chatbot-api/v1/chat-config-payload`,
    retryable: true,
    withCredentials: false,
  },
};
