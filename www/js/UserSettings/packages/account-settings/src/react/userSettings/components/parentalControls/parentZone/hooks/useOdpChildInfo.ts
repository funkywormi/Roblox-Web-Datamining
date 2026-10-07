import { userId } from "@rbx/core-scripts/meta/user";
import { TChildSettingsInfo } from "../../../../../../types/childrenInfoTypes";
import { useGetOdpChildContextQuery } from "../../../../../apis/parentalControlsApi";
import { useGetSettingsUiPolicyQuery } from "../../../../../apis/universalAppConfigurationApi";
import { useGetBirthdateQuery } from "../../../../../apis/usersApi";
import { useGetAgeGroupQuery } from "../../../../../apis/accountInsightsApi";

/**
 * Assembles the signed-in child's settings info for an on-device parent (ODP) view, combining the
 * ODP child context, UI policy, birthdate and age group. The context and policy queries are read
 * directly here and resolve from the shared RTK query cache, so no extra network calls are made.
 *
 * @returns The child settings info plus loading/error status for the birthdate and age-group reads.
 */
const useOdpChildInfo = () => {
  const context = useGetOdpChildContextQuery();
  const id = userId();
  const skip = context.data?.canManageSettings !== true || id === null;
  const policy = useGetSettingsUiPolicyQuery(undefined, { skip });
  const birthdate = useGetBirthdateQuery(undefined, { skip });
  const ageGroup = useGetAgeGroupQuery({}, { skip });
  const child: TChildSettingsInfo | undefined =
    !skip && birthdate.data && ageGroup.data && policy.data
      ? {
          ...context.data,
          userId: id,
          birthDate: `${birthdate.data.birthYear}-${String(birthdate.data.birthMonth).padStart(2, "0")}-${String(birthdate.data.birthDay).padStart(2, "0")}`,
          isAgeChecked: ageGroup.data.isChecked,
          canSeeChatTerminology: policy.data.canSeeChatTerminology,
          shouldShowTFRestrictiveCommsCopy: policy.data.shouldShowTFRestrictiveCommsCopy,
          shouldShowRemovedCommsCopy: policy.data.shouldShowRemovedCommsCopy,
          shouldShowGenericShareActivityUpdatesCopy:
            policy.data.shouldShowGenericShareActivityUpdatesCopy,
          isTrustedFriendsInVisibilitySettingsRolledOut:
            policy.data.isTrustedFriendsInVisibilitySettingsRolledOut,
          shouldShowRestrictivePresetChatSetting:
            policy.data.shouldShowRestrictivePresetChatSetting,
          shouldDisplayPartySettingsV2: policy.data.shouldDisplayPartySettingsV2,
        }
      : undefined;
  return {
    child,
    isLoading: birthdate.isLoading || ageGroup.isLoading,
    isError: birthdate.isError || ageGroup.isError,
  };
};

export default useOdpChildInfo;
