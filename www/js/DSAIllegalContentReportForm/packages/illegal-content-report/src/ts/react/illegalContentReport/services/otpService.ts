import { EnvironmentUrls } from '@rbx/legacy-webapp-types/Roblox';
import { httpService } from '@rbx/core-scripts/legacy/core-utilities';
import {
  TSendCodeRequest,
  TSendCodeResponse,
  TResendCodeRequest,
  TResendCodeResponse,
  TValidateCodeRequest,
  TValidateCodeResponse
} from '../types/otpTypes';

const getApiUrl = (endpoint: string): string => {
  return `${EnvironmentUrls.apiGatewayUrl}/otp-service/v1/${endpoint}`;
};

export const sendCode = async (params: TSendCodeRequest): Promise<TSendCodeResponse> => {
  const url = getApiUrl('sendCode');
  const urlConfig = {
    url,
    withCredentials: true
  };
  const { data } = await httpService.post<TSendCodeResponse>(urlConfig, params);
  return data;
};

export const resendCode = async (params: TResendCodeRequest): Promise<TResendCodeResponse> => {
  const url = getApiUrl('resendCode');
  const urlConfig = {
    url,
    withCredentials: true
  };
  const { data } = await httpService.post<TResendCodeResponse>(urlConfig, params);
  return data;
};

export const validateCode = async (
  params: TValidateCodeRequest
): Promise<TValidateCodeResponse> => {
  const url = getApiUrl('validateCode');
  const urlConfig = {
    url,
    withCredentials: true
  };
  const { data } = await httpService.post<TValidateCodeResponse>(urlConfig, params);
  return data;
};
