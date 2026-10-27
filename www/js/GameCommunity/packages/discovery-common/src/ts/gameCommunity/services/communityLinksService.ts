import * as http from "@rbx/core-scripts/http";
import { getCommunityInfoUrl } from "../utils/urlHelper";
import { CommunityInfo } from "../types";

export default {
  getLinkedCommunity: async (universeId: string): Promise<CommunityInfo> => {
    const urlConfig = {
      url: getCommunityInfoUrl(universeId),
      retryable: true,
      withCredentials: true,
    };

    const { data } = await http.get(urlConfig);
    return data as CommunityInfo;
  },
};
