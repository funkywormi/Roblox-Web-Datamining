import environmentUrls from "@rbx/environment-urls";
import { get } from "@rbx/core-scripts/http";
import { BeduiResponseDataType } from "./types";

const fetchBeduiData = async (
  _targetId: string,
  abuseVector: string,
  _customParams: string,
  locale: string,
): Promise<BeduiResponseDataType> => {
  const params = new URLSearchParams({
    surface: "web",
    version: "v1",
    context: abuseVector,
    locale,
  });

  const response = await get<BeduiResponseDataType>({
    url: `${
      environmentUrls.apiGatewayUrl
    }/abuse-reporting/v1/dynamic-dialog-sequential?${params.toString()}`,
    withCredentials: true,
  });
  return response.data;
};

export default fetchBeduiData;
