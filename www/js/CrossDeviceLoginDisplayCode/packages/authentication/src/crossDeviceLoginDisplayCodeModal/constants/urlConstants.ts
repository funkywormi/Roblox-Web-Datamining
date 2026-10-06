import { EnvironmentUrls } from "@rbx/environment-urls";

const { apiGatewayUrl } = EnvironmentUrls;

const createCodeUrlConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${apiGatewayUrl}/auth-token-service/v1/login/create`,
});

const pullCrossDeviceLoginStatusUrlConfig = () => ({
  retryable: true,
  url: `${apiGatewayUrl}/auth-token-service/v1/login/status`,
});

const cancelCrossDeviceLoginCodeUrlConfig = () => ({
  retryable: true,
  url: `${apiGatewayUrl}/auth-token-service/v1/login/cancel`,
});

const getXDLDisplayCodeExperimentEnrollmentsUrlConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${apiGatewayUrl}/product-experimentation-platform/v1/projects/1/layers/Website.Login.CrossDeviceLogin.DisplayCode/values`,
});

const getAuthTokenServiceMetadataUrlConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${apiGatewayUrl}/auth-token-service/v1/login/metadata`,
});

const XDLDisplayCodeExperimentParameters = [
  "alt_title",
  "alt_instruction",
  "alt_device_specific_instruction",
];

const qrHelpUrl = "https://en.help.roblox.com/hc/en-us/articles/360056582012";

export {
  createCodeUrlConfig,
  pullCrossDeviceLoginStatusUrlConfig,
  cancelCrossDeviceLoginCodeUrlConfig,
  getXDLDisplayCodeExperimentEnrollmentsUrlConfig,
  getAuthTokenServiceMetadataUrlConfig,
  XDLDisplayCodeExperimentParameters,
  qrHelpUrl,
};
