import * as http from "@rbx/core-scripts/http";
import { setGlobalPrivacyControlConfig, getUserSettingsConfig } from "../constants/urlConstants";

const setGlobalPrivacyControlAsync = async (): Promise<void> => {
  const urlConfig = setGlobalPrivacyControlConfig();
  await http.post(urlConfig);
};

const getUserSettingsAsync = async <T>(): Promise<T> => {
  const { data } = await http.get<T>(getUserSettingsConfig());
  return data;
};

export { setGlobalPrivacyControlAsync, getUserSettingsAsync };
