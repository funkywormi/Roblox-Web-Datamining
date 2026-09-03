import * as http from "@rbx/core-scripts/http";
import { pushEnabledUrl } from "../constants/urlConstants";

type GetPushEnabledResponse = {
  destination: string | null;
};

const pushEnabledUrlConfig = {
  url: pushEnabledUrl,
  retryable: true,
  withCredentials: true,
};

export async function isPushEnabled(): Promise<boolean> {
  const result = await http.get<GetPushEnabledResponse>(pushEnabledUrlConfig);
  return Boolean(result.data.destination);
}
