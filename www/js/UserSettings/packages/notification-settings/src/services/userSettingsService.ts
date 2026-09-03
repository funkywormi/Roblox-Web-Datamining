import * as http from "@rbx/core-scripts/http";
import { userSettingsV2Url, type TOptionValue } from "@rbx/user-settings";

const urlConfig = {
  url: userSettingsV2Url,
  retryable: true,
  withCredentials: true,
};

type UpdateUserSettingOptions = {
  /** Base64 audit payload for legally-sensitive preference changes (e.g. announcements email). */
  auditHeader?: string;
};

/**
 * Updates a user setting with the given key and value.
 * Throws on failure.
 */
export async function updateUserSetting(
  settingKey: string,
  value: TOptionValue,
  options?: UpdateUserSettingOptions,
): Promise<void> {
  const requestConfig =
    options?.auditHeader !== undefined && options.auditHeader !== ""
      ? { ...urlConfig, headers: { "rbx-audit-data": options.auditHeader } }
      : urlConfig;

  await http.post(requestConfig, {
    [settingKey]: value,
  });
}
