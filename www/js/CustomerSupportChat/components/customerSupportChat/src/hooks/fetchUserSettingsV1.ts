import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import { UserSettingsV1 } from "../core/types/userSettings";
import { apiSet } from "../core/constants/services";

const fetchUserSettings = async (): Promise<UserSettingsV1> => {
  const { data } = await httpService.get<UserSettingsV1>(apiSet.fetchAccountSettingsV1);
  return data;
};

export default fetchUserSettings;
