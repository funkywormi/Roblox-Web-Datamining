import type { AxiosResponse } from 'axios';
import { httpService } from 'core-utilities';
import { EnvironmentUrls } from 'Roblox';
import { Address } from '../constants/TypeDefinitions';

// TODO: add frontend tracking via grafana for this API call.
export type GetUserSettingsAddressResponse = {
  address: {
    country: string;
    state: string;
    city: string;
    postalCode: string;
  };
};

export type GetApproximateUserLocationResponse = {
  countryCode: string;
  subdivision: string;
  city: string;
  postalCode: string;
};

export type UpsertUserSettingsAddressResponse = {};

const getApproximateUserLocationConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/user-location/approximate-location`
});

const getUserSettingsAddressConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/user-settings-address`
});

const UpsertUserSettingsAddressConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/user-settings-address`
});

export const getApproximateUserLocation = async (): Promise<
  AxiosResponse<GetApproximateUserLocationResponse>
> => {
  const urlConfig = getApproximateUserLocationConfig();
  const requestBody = {};
  return httpService.get(urlConfig, requestBody);
};

export const getUserSettingsAddress = async (): Promise<
  AxiosResponse<GetUserSettingsAddressResponse>
> => {
  const urlConfig = getUserSettingsAddressConfig();
  const requestBody = {};
  return httpService.get(urlConfig, requestBody);
};

export const upsertUserSettingsAddress = async (
  address: Address
): Promise<AxiosResponse<UpsertUserSettingsAddressResponse>> => {
  const urlConfig = UpsertUserSettingsAddressConfig();
  const requestBody = { address };
  return httpService.patch(urlConfig, requestBody);
};
