import { userId } from "@rbx/core-scripts/meta/user";
import { QueryStatus } from "@reduxjs/toolkit/query";
import {
  useGetOdpChildContextQuery,
  useGetParentInfoQuery,
} from "../../../../../apis/parentalControlsApi";
import useGetSettingsAndOptions from "../../../../../apis/hooks/useGetSettingsAndOptions";
import useGetSettingsAndOptionsV2 from "../../../../../apis/hooks/useGetSettingsAndOptionsV2";
import { useGetSettingsUiPolicyQuery } from "../../../../../apis/universalAppConfigurationApi";
import { useGetParentalSpendControlsQuery } from "../../../../../apis/billingApi";
import SettingCategoryPageName from "../../../../../../enums/SettingCategoryPageName";
import { getOdpSettingsPages } from "../odpSettingsPages";

/**
 * Fetches the on-device parent (ODP) child context, settings/options and UI policy for the
 * signed-in child, and builds the set of ODP settings pages to render in the Parent Zone.
 *
 * @returns The ODP settings pages plus loading/error/fetching status and the raw context/policy.
 */
const useOdpSettingsAndPages = (pageName?: string) => {
  const context = useGetOdpChildContextQuery();
  const childUserId = userId();
  const shouldSkipSettingsQueries =
    context.data?.canManageSettings !== true || context.isError || childUserId === null;
  const [settings, settingsStatus] = useGetSettingsAndOptions(childUserId ?? undefined, {
    skip: shouldSkipSettingsQueries,
    showErrorSnackbar: false,
  });
  const [settingsV2, isSettingsV2Loading, isSettingsV2Error, isSettingsV2Fetching] =
    useGetSettingsAndOptionsV2(childUserId ?? undefined, {
      skip: shouldSkipSettingsQueries,
      showErrorSnackbar: false,
    });
  const policy = useGetSettingsUiPolicyQuery(undefined, { skip: shouldSkipSettingsQueries });
  const spendControls = useGetParentalSpendControlsQuery(undefined, {
    skip: shouldSkipSettingsQueries || context.data?.canParentViewChildSpendRestrictions !== true,
  });
  const parentInfo = useGetParentInfoQuery(undefined, {
    skip: shouldSkipSettingsQueries || context.data?.canParentViewChildSpendRestrictions !== true,
  });
  const hasRemoteParent =
    !parentInfo.isError &&
    parentInfo.data?.parents.some(parent => parent.isOnDeviceParent !== true) === true;
  const queries = [
    context,
    policy,
    ...(pageName === SettingCategoryPageName.Spending ? [spendControls] : []),
  ];
  const isError =
    settingsStatus === QueryStatus.rejected ||
    isSettingsV2Error ||
    queries.some(query => query.isError);

  return {
    pages:
      isError || shouldSkipSettingsQueries
        ? {}
        : getOdpSettingsPages(
            context.data,
            settings,
            settingsV2,
            policy.data,
            spendControls.data,
            hasRemoteParent,
          ),
    isLoading:
      (settingsStatus === QueryStatus.pending && !settings) ||
      isSettingsV2Loading ||
      (pageName === SettingCategoryPageName.Spending && parentInfo.isLoading) ||
      queries.some(query => query.isLoading),
    isError,
    isFetching:
      settingsStatus === QueryStatus.pending ||
      isSettingsV2Fetching ||
      queries.some(query => query.isFetching),
    policy: policy.data,
    context: context.data,
  };
};

export default useOdpSettingsAndPages;
