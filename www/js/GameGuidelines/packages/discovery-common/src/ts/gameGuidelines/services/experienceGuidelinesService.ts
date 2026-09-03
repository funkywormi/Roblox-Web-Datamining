import * as http from "@rbx/core-scripts/http";
import urlConstant from "../constants/urlConstants";

const { getAgeRecommendationUrl } = urlConstant;

export default {
  getAgeRecommendation: (universeId: string) => {
    const urlConfig = {
      url: getAgeRecommendationUrl(),
      retryable: true,
      withCredentials: true,
    };

    const data = {
      universeId,
    };

    return http.post(urlConfig, data);
  },
};
