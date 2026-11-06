import { EnvironmentUrls } from "@rbx/environment-urls";
import {
  TResendCodeRequest,
  TResendCodeResponse,
  TSendCodeRequest,
  TSendCodeResponse,
  TValidateCodeRequest,
  TValidateCodeResponse,
} from "@rbx/authentication-common/types/otpTypes";
import transport from "../../shared/request/requestTransport";

const getApiUrl = (endpoint: string): string => {
  return `${EnvironmentUrls.apiGatewayUrl}/otp-service/v1/${endpoint}`;
};

export const sendCode = (params: TSendCodeRequest): Promise<TSendCodeResponse> => {
  const url = getApiUrl("sendCode");
  const urlConfig = {
    url,
    withCredentials: true,
  };
  return transport.post<TSendCodeResponse>(urlConfig, params);
};

export const resendCode = (params: TResendCodeRequest): Promise<TResendCodeResponse> => {
  const url = getApiUrl("resendCode");
  const urlConfig = {
    url,
    withCredentials: true,
  };
  return transport.post<TResendCodeResponse>(urlConfig, params);
};

export const validateCode = (params: TValidateCodeRequest): Promise<TValidateCodeResponse> => {
  const url = getApiUrl("validateCode");
  const urlConfig = {
    url,
    withCredentials: true,
  };
  return transport.post<TValidateCodeResponse>(urlConfig, params);
};
