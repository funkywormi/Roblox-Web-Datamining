import { UseQueryResult, useQuery } from "@tanstack/react-query";
import * as http from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";
import { SETTINGS_AND_OPTIONS_QUERY_KEY } from "./queryKeys";

export interface SettingOption {
  option: {
    optionValue?: unknown;
  };
  requiredActions?: string[];
}

export type SettingsAndOptionsResponse = Record<
  string,
  | {
      /** The setting's value today, e.g. `"Enabled"`. */
      currentValue?: unknown;
      options?: SettingOption[];
    }
  | undefined
>;

export const getSettingsAndOptions = async (
  settingName: string,
): Promise<SettingsAndOptionsResponse> => {
  const { data } = await http.get<SettingsAndOptionsResponse>({
    url: `${environmentUrls.userSettingsApi}/v2/user-settings/settings-and-options-subset?requestedUserSettings=${encodeURIComponent(settingName)}`,
    withCredentials: true,
  });

  return data;
};

/**
 * Fetches the current user's settings-and-options metadata for one setting.
 *
 * The imperative appeal flow calls `getSettingsAndOptions` after AMP identifies
 * the setting. React consumers can use this hook when the setting is known
 * during render.
 */
export const useGetSettingsAndOptions = (
  settingName: string,
  { enabled = true }: { enabled?: boolean } = {},
): UseQueryResult<SettingsAndOptionsResponse> =>
  useQuery({
    queryKey: [SETTINGS_AND_OPTIONS_QUERY_KEY, settingName],
    queryFn: () => getSettingsAndOptions(settingName),
    enabled: enabled && settingName.length > 0,
  });
