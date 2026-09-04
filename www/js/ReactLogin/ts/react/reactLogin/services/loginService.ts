import { EnvironmentUrls } from 'Roblox';
import { httpService } from 'core-utilities';
import {
  TAuthTokenServiceMetadataResponse,
  TCredentialsVerificationParams,
  TCredentialsVerificationResponse,
  TLoginWithVerificationTokenParams,
  TLoginWithVerificationTokenResponse,
  TLoginParams,
  TLoginResponse
} from '../../common/types/loginTypes';

// helper functions to build url
const getApiUrl = (endpoint: string): string => EnvironmentUrls.authApi + endpoint;
const getApiGatewayUrl = (endpoint: string): string => EnvironmentUrls.apiGatewayUrl + endpoint;

export const canVerifyCredentials = async (
  params: TCredentialsVerificationParams
): Promise<TCredentialsVerificationResponse> => {
  const url = getApiUrl('/v2/credentials/verification');
  const urlConfig = {
    url
  };
  const { data } = await httpService.post<TCredentialsVerificationResponse>(urlConfig, params);
  return data;
};

export const verifyCredentials = async (params: TCredentialsVerificationParams): Promise<{}> => {
  const url = getApiUrl('/v2/credentials/verification/send');
  const urlConfig = {
    url
  };
  const { data } = await httpService.post<TCredentialsVerificationResponse>(urlConfig, params);
  return data;
};

export const getAuthTokenMetadata = async (): Promise<TAuthTokenServiceMetadataResponse> => {
  const url = getApiGatewayUrl('/auth-token-service/v1/login/metadata');
  const urlConfig = {
    url
  };
  const { data } = await httpService.get<TAuthTokenServiceMetadataResponse>(urlConfig);
  return data;
};

export const loginWithVerificationToken = async (
  userId: string,
  params: TLoginWithVerificationTokenParams
): Promise<TLoginWithVerificationTokenResponse> => {
  const url = getApiUrl(`/v3/users/${userId}/two-step-verification/login`);
  const urlConfig = {
    url,
    withCredentials: true
  };
  const { data } = await httpService.post<TLoginWithVerificationTokenResponse>(urlConfig, params);
  return data;
};
export const login = async (params: TLoginParams): Promise<TLoginResponse> => {
  const url = getApiUrl('/v2/login');
  const urlConfig = {
    url,
    withCredentials: true
  };
  const { data } = await httpService.post<TLoginResponse>(urlConfig, params);
  return data;
};
