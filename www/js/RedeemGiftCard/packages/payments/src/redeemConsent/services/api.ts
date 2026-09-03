import type { AxiosResponse } from "axios";
import { EnvironmentUrls } from "Roblox";
import { httpService } from "core-utilities";

type LocalCreditRedemptionConsent = {
  needConsent: boolean;
};

export const getLocalCreditRedemptionConsentConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/gift-card/v1/get-local-credit-redemption-consent`,
});

export const getLocalCreditRedemptionConsent = async (): Promise<
  AxiosResponse<LocalCreditRedemptionConsent>
> => {
  const urlConfig = getLocalCreditRedemptionConsentConfig();
  return httpService.get<LocalCreditRedemptionConsent>(urlConfig);
};
