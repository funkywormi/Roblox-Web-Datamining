import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-utilities";
import { TUserSettingsAndOptionsV2Body, useSnackbar } from "@rbx/user-settings";
import { useGetChildSettingsV2Query } from "../parentalControlsApi";
import { useGetUserSettingsAndOptionsV2Query } from "../userSettingsApi";
import commonTranslationConstants from "../../userSettings/constants/contentConstants/commonTranslationConstants";

/**
 * Custom hook to get settings and options
 *
 * @param childUserId - The ID of the child user (optional).
 * @returns The settings and options  - either the user's own, or a child's, if a childUserId is provided.
 * @returns The status of the settings and options query.
 */
const useGetSettingsAndOptionsV2 = (
  childUserId?: number,
): [TUserSettingsAndOptionsV2Body | undefined, boolean, boolean, boolean] => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();

  const [settingsAndOptions, setSettingsAndOptions] = useState<TUserSettingsAndOptionsV2Body>();
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(true);
  const [isError, setIsError] = useState(false);
  // If childUserId is provided, get the child's settings and options. Otherwise, get the user's own settings and options.
  const {
    data: userSettingsAndOptions,
    isLoading: isUserSettingsAndOptionsLoading,
    isFetching: isUserSettingsAndOptionsFetching,
    isError: isUserSettingsAndOptionsError,
  } = useGetUserSettingsAndOptionsV2Query(childUserId ? skipToken : undefined);
  const {
    data: childSettingAndOptions,
    isLoading: isChildSettingAndOptionsLoading,
    isError: isChildSettingAndOptionsError,
    isFetching: isChildSettingAndOptionsFetching,
  } = useGetChildSettingsV2Query(childUserId ?? skipToken);

  useEffect(() => {
    const hasError = isUserSettingsAndOptionsError || isChildSettingAndOptionsError;

    if (hasError) {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    }

    if (childUserId) {
      setSettingsAndOptions(childSettingAndOptions);
      setIsLoading(isChildSettingAndOptionsLoading);
      setIsError(isChildSettingAndOptionsError);
      setIsFetching(isChildSettingAndOptionsFetching);
    } else {
      setSettingsAndOptions(userSettingsAndOptions);
      setIsLoading(isUserSettingsAndOptionsLoading);
      setIsError(isUserSettingsAndOptionsError);
      setIsFetching(isUserSettingsAndOptionsFetching);
    }
  }, [
    childUserId,
    childSettingAndOptions,
    userSettingsAndOptions,
    isChildSettingAndOptionsLoading,
    isUserSettingsAndOptionsLoading,
    isChildSettingAndOptionsError,
    isUserSettingsAndOptionsError,
    isChildSettingAndOptionsFetching,
    isUserSettingsAndOptionsFetching,
  ]);
  return [settingsAndOptions, isLoading, isError, isFetching];
};

export default useGetSettingsAndOptionsV2;
