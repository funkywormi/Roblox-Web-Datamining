import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-scripts/http";
import { UrlConfig } from "@rbx/core-scripts/http";

const DESCRIPTION_URL = `${environmentUrls.usersApi}/v1/description`;

export interface DescriptionResponse {
  description: string;
}

export async function getDescriptionAsync(): Promise<string> {
  const urlConfig: UrlConfig = {
    url: DESCRIPTION_URL,
    withCredentials: true,
  };

  const response = await http.get<DescriptionResponse>(urlConfig);
  return response.data.description;
}
