import { QueryStatus, skipToken } from "@reduxjs/toolkit/dist/query";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-utilities";
import { TUserSettingsAndOptionsBody, useSnackbar } from "@rbx/user-settings";
import { useGetChildSettingsQuery } from "../parentalControlsApi";
import { useGetUserSettingsAndOptionsQuery } from "../userSettingsApi";
import {
  getSettingConsentRequirements,
  TSettingConsentRequirements,
} from "../slices/parentalConsentSlice";
import commonTranslationConstants from "../../userSettings/constants/contentConstants/commonTranslationConstants";

export type TSettingsQueryOptions = {
  skip?: boolean;
  showErrorSnackbar?: boolean;
};

/**
 * Custom hook to get settings and options.
 *
 * @param childUserId - The ID of the child user (optional). Passed for both a remote parent and
 *   an on-device parent (ODP) viewing a child's settings.
 * @returns The settings and options - either the user's own, or a child's, if a childUserId is provided.
 * @returns The status of the settings and options query.
 * @returns The consent requirements derived from the settings and options.
 */
const useGetSettingsAndOptions = (
  childUserId?: number,
  { skip = false, showErrorSnackbar = true }: TSettingsQueryOptions = {},
): [
  TUserSettingsAndOptionsBody | undefined,
  QueryStatus,
  TSettingConsentRequirements | undefined,
] => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();
  const userQuery = useGetUserSettingsAndOptionsQuery(
    skip || childUserId !== undefined ? skipToken : undefined,
  );
  const childQuery = useGetChildSettingsQuery(skip ? skipToken : (childUserId ?? skipToken));
  const { data, status } = childUserId !== undefined ? childQuery : userQuery;
  const consentRequirements = useMemo(() => data && getSettingConsentRequirements(data), [data]);

  useEffect(() => {
    if (
      showErrorSnackbar &&
      (status === QueryStatus.rejected || (status === QueryStatus.fulfilled && !data))
    ) {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    }
  }, [data, status, showErrorSnackbar]);

  return [data, status, consentRequirements];
};

export default useGetSettingsAndOptions;
