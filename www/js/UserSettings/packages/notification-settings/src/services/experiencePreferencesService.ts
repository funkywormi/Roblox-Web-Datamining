import * as http from "@rbx/core-scripts/http";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import { experiencePreferencesUrl, getFollowingUniverseUrl } from "../constants/urlConstants";

export type ExperiencePreferencesPayload = {
  notificationsEnabledExperiences: number[] | null;
  parentalControlsEnabled?: boolean;
};

type GetExperiencePreferencesResponse = {
  experiencePreferences: ExperiencePreferencesPayload;
};

const getExperiencePreferences = async (): Promise<ExperiencePreferencesPayload> => {
  const response = await http.get<GetExperiencePreferencesResponse>({
    url: experiencePreferencesUrl,
    withCredentials: true,
  });
  return response.data.experiencePreferences;
};

const enableExperienceFollowing = async (universeId: number): Promise<void> => {
  await http.post({
    url: getFollowingUniverseUrl(String(authenticatedUser.id), universeId),
    withCredentials: true,
  });
};

const disableExperienceFollowing = async (universeId: number): Promise<void> => {
  await http.delete({
    url: getFollowingUniverseUrl(String(authenticatedUser.id), universeId),
    withCredentials: true,
  });
};

export default {
  getExperiencePreferences,
  enableExperienceFollowing,
  disableExperienceFollowing,
};
