import { EnvironmentUrls } from "Roblox";

const { billingApi } = EnvironmentUrls;

const getRedeemUrlConfig = () => ({
  withCredentials: true,
  url: `${billingApi}/v1/promocodes/redeem`,
});

export default getRedeemUrlConfig;
