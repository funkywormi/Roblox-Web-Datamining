import { EnvironmentUrls } from 'Roblox';

const { apiGatewayUrl } = EnvironmentUrls;

const postEnterCodeUrlConfig = () => ({
  retryable: false,
  withCredentials: true,
  url: `${apiGatewayUrl}/auth-token-service/v1/login/enterCode`
});

const postValidateCodeUrlConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${apiGatewayUrl}/auth-token-service/v1/login/validateCode`
});

const postCancelCodeUrlConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${apiGatewayUrl}/auth-token-service/v1/login/cancel`
});

const getExperimentEnrollmentsUrlConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${apiGatewayUrl}/product-experimentation-platform/v1/projects/1/layers/CrossDeviceLogin.ConfirmCode/values`
});

const getAuthTokenServiceMetadataUrlConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${apiGatewayUrl}/auth-token-service/v1/login/metadata`
});

const confirmCodeExperimentParameters = ['ShouldNotClearCodeOnInvalidSubmission'];
const invalidLocationErrorValue = 'InvalidLocation';
const codeInvalidErrorValue = 'CodeInvalid';

export {
  postEnterCodeUrlConfig,
  postValidateCodeUrlConfig,
  postCancelCodeUrlConfig,
  getExperimentEnrollmentsUrlConfig,
  getAuthTokenServiceMetadataUrlConfig,
  confirmCodeExperimentParameters,
  invalidLocationErrorValue,
  codeInvalidErrorValue
};
