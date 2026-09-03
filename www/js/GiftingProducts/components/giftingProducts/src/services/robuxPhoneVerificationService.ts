import { EnvironmentUrls } from "@rbx/environment-urls";
import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import type { AxiosResponse } from "@rbx/core-scripts/http";

const initiatePhoneVerificationServiceConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/phone-verification-session/send`,
});

const verifyPhoneVerificationSessionConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/phone-verification-session/verify`,
});

export type InitiatePhoneVerificationSessionResponse = {
  phoneVerificationSessionId: string;
};

export type VerifyPhoneVerificationSessionResponse = {
  phoneVerificationSessionId: string;
};

export const initiatePhoneVerificationSession = async (
  countryCodeNumber: string,
  countryCodeISO: string,
  phoneNumber: string,
): Promise<AxiosResponse<InitiatePhoneVerificationSessionResponse>> => {
  const urlConfig = initiatePhoneVerificationServiceConfig();
  const requestBody = {
    countryCodeNumber,
    countryCodeISO,
    phoneNumber,
  };

  return httpService.post(urlConfig, requestBody);
};

export const verifyPhoneVerificationSession = async (
  phoneVerificationSessionId: string,
  verificationCode: string,
): Promise<AxiosResponse<VerifyPhoneVerificationSessionResponse>> => {
  const urlConfig = verifyPhoneVerificationSessionConfig();
  const requestBody = {
    phoneVerificationSessionId,
    verificationCode,
  };

  return httpService.post(urlConfig, requestBody);
};
