import { EnvironmentUrls } from "@rbx/legacy-webapp-types/Roblox";
import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import { Urls } from './constants';
import { SubmitRequestBody, MetadataResponse, SendReportResponse } from './types';

const getMetadata = async (): Promise<MetadataResponse> => {
  const doamin = EnvironmentUrls.websiteUrl;
  const urlConfig = {
    url: `${doamin}${Urls.SUPPORT_WEB_SUBSITE_COUNTRY_LIST_PATH}`,
    headers: { 'Content-Type': 'application/json' }
  };
  const { data } = await httpService.get<MetadataResponse>(urlConfig);
  return data;
};

const sendReport = async (requestBody: SubmitRequestBody): Promise<SendReportResponse> => {
  const url = `${EnvironmentUrls.websiteUrl}${Urls.SUPPORT_WEB_SUBSITE_BASE_PATH}`;
  const urlConfig = {
    url
  };
  const response = await httpService.post<SendReportResponse>(urlConfig, requestBody);
  return response.data;
};

export { getMetadata, sendReport };
