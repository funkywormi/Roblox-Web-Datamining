import environmentUrls from "@rbx/environment-urls";

const { apiGatewayUrl, voiceApi } = environmentUrls;

const getUpsellCardTypeUrlConfig = () => ({
  retryable: false,
  withCredentials: true,
  url: `${apiGatewayUrl}/upsellCard/type`,
});

const getDismissUpsellCardUrlConfig = () => ({
  retryable: false,
  withCredentials: true,
  url: `${apiGatewayUrl}/upsellCard/dismiss`,
});

const optUserInToVoiceChatConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${voiceApi}/v1/settings/user-opt-in`,
});

export { getUpsellCardTypeUrlConfig, optUserInToVoiceChatConfig, getDismissUpsellCardUrlConfig };
