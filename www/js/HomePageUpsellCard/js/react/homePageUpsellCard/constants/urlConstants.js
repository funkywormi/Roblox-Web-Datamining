import { EnvironmentUrls } from 'Roblox';

const { apiGatewayUrl, voiceApi } = EnvironmentUrls;

const getUpsellCardTypeUrlConfig = () => ({
  retryable: false,
  withCredentials: true,
  url: `${apiGatewayUrl}/upsellCard/type`
});

const getDismissUpsellCardUrlConfig = () => ({
  retryable: false,
  withCredentials: true,
  url: `${apiGatewayUrl}/upsellCard/dismiss`
});

const optUserInToVoiceChatConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${voiceApi}/v1/settings/user-opt-in`
});

// eslint-disable-next-line import/prefer-default-export
export { getUpsellCardTypeUrlConfig, optUserInToVoiceChatConfig, getDismissUpsellCardUrlConfig };
