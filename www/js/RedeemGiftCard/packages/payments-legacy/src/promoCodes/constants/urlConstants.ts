import { EnvironmentUrls } from "@rbx/environment-urls";

const { billingApi } = EnvironmentUrls;

const getRedeemUrlConfig = () => ({
  withCredentials: true,
  url: `${billingApi}/v1/promocodes/redeem`,
});

export default getRedeemUrlConfig;
