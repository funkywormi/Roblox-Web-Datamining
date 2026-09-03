import { EnvironmentUrls } from "Roblox";

const { billingApi, apiGatewayUrl } = EnvironmentUrls;

export const twentyPercentMoreRobuxUKLayerName = "Payments.BuyRobux.TwentyPercentMoreRobux";
export const twentyPercentMoreRobuxBrazilLayerName =
  "Payments.BuyRobux.TwentyPercentMoreRobux.Brazil";

export const getRedeemGiftCardMetadataUrlConfig = () => ({
  withCredentials: true,
  url: `${billingApi}/v1/gamecard/redeem/metadata`,
});

export const redeemPaymentsGatewayConfig = () => ({
  withCredentials: true,
  url: `${apiGatewayUrl}/payments-gateway/v1/gift-card/redeem`,
});
