import { QueryStatus, skipToken } from "@reduxjs/toolkit/dist/query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-utilities";
import { TUserSettingsAndOptionsBody, useSnackbar } from "@rbx/user-settings";
import { useGetChildSettingsQuery } from "../parentalControlsApi";
import { useGetUserSettingsAndOptionsQuery } from "../userSettingsApi";
import commonTranslationConstants from "../../userSettings/constants/contentConstants/commonTranslationConstants";

/**
 * Custom hook to get settings and options
 *
 * @param childUserId - The ID of the child user (optional).
 * @returns The settings and options  - either the user's own, or a child's, if a childUserId is provided.
 * @returns The status of the settings and options query.
 */
const useGetSettingsAndOptions = (
  childUserId?: number,
): [TUserSettingsAndOptionsBody | undefined, QueryStatus | undefined] => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();

  const [settingsAndOptions, setSettingsAndOptions] = useState<TUserSettingsAndOptionsBody>();
  const [settingsAndOptionsStatus, setSettingsAndOptionsStatus] = useState<QueryStatus>();

  // If childUserId is provided, get the child's settings and options. Otherwise, get the user's own settings and options.
  const { data: userSettingsAndOptions, status: userSettingsAndOptionsStatus } =
    useGetUserSettingsAndOptionsQuery(childUserId ? skipToken : undefined);
  const { data: childSettingAndOptions, status: childSettingAndOptionsStatus } =
    useGetChildSettingsQuery(childUserId ?? skipToken);

  useEffect(() => {
    const hasError =
      userSettingsAndOptionsStatus === QueryStatus.rejected ||
      (userSettingsAndOptionsStatus === QueryStatus.fulfilled && !userSettingsAndOptions) ||
      childSettingAndOptionsStatus === QueryStatus.rejected ||
      (childSettingAndOptionsStatus === QueryStatus.fulfilled && !childSettingAndOptions);

    if (hasError) {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    }

    if (childUserId) {
      setSettingsAndOptions(childSettingAndOptions);
      setSettingsAndOptionsStatus(childSettingAndOptionsStatus);
    } else {
      setSettingsAndOptions(userSettingsAndOptions);
      setSettingsAndOptionsStatus(userSettingsAndOptionsStatus);
    }
  }, [
    childUserId,
    childSettingAndOptions,
    userSettingsAndOptions,
    childSettingAndOptionsStatus,
    userSettingsAndOptionsStatus,
  ]);
  return [settingsAndOptions, settingsAndOptionsStatus];
};

export default useGetSettingsAndOptions;
