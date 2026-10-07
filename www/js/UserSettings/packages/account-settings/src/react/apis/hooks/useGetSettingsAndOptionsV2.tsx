import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-utilities";
import { TUserSettingsAndOptionsV2Body, useSnackbar } from "@rbx/user-settings";
import { useGetChildSettingsV2Query } from "../parentalControlsApi";
import { useGetUserSettingsAndOptionsV2Query } from "../userSettingsApi";
import {
  getSettingConsentRequirementsV2,
  TSettingConsentRequirementsV2,
} from "../slices/parentalConsentSlice";
import type { TSettingsQueryOptions } from "./useGetSettingsAndOptions";
import commonTranslationConstants from "../../userSettings/constants/contentConstants/commonTranslationConstants";

/**
 * Custom hook to get V2 settings and options.
 *
 * @param childUserId - The ID of the child user (optional). Passed for both a remote parent and
 *   an on-device parent (ODP) viewing a child's settings.
 * @returns The settings and options - either the user's own, or a child's, if a childUserId is provided.
 * @returns isLoading, isError, and isFetching flags for the settings and options query.
 * @returns The consent requirements derived from the settings and options.
 */
const useGetSettingsAndOptionsV2 = (
  childUserId?: number,
  { skip = false, showErrorSnackbar = true }: TSettingsQueryOptions = {},
): [
  TUserSettingsAndOptionsV2Body | undefined,
  boolean,
  boolean,
  boolean,
  TSettingConsentRequirementsV2 | undefined,
] => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();
  const userQuery = useGetUserSettingsAndOptionsV2Query(
    skip || childUserId !== undefined ? skipToken : undefined,
  );
  const childQuery = useGetChildSettingsV2Query(skip ? skipToken : (childUserId ?? skipToken));
  const { data, isLoading, isError, isFetching } =
    childUserId !== undefined ? childQuery : userQuery;
  const consentRequirements = useMemo(() => data && getSettingConsentRequirementsV2(data), [data]);

  useEffect(() => {
    if (showErrorSnackbar && isError) {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    }
  }, [isError, showErrorSnackbar]);

  return [data, isLoading, isError, isFetching, consentRequirements];
};

export default useGetSettingsAndOptionsV2;
