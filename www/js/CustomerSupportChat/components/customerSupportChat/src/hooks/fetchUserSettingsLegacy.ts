import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import { UserSettingsLegacy } from "../core/types/userSettings";
import { apiSet } from "../core/constants/services";

const fetchUserSettingsLegacy = async (): Promise<UserSettingsLegacy> => {
  const { data } = await httpService.get<UserSettingsLegacy>(apiSet.fetchAccountSettingsLegacy);
  return data;
};
export default fetchUserSettingsLegacy;
