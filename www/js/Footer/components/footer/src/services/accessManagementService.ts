import * as http from "@rbx/core-scripts/http";
import { getAmpUpsellUrlConfig } from "../constants/urlConstants";

const featureCheckAsync = async <T>(featureName: string, namespace: string): Promise<T> => {
  const urlConfig = getAmpUpsellUrlConfig(featureName, namespace);
  const { data } = await http.get<T>(urlConfig);
  return data;
};

export { featureCheckAsync };
