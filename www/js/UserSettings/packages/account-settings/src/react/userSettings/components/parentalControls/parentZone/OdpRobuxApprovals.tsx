import React, { useEffect } from "react";
import { RobuxTransferApprovalMode, UserSetting } from "@rbx/user-settings";
import { useGetParentInfoQuery } from "../../../../apis/parentalControlsApi";
import useGetSettingsAndOptionsV2 from "../../../../apis/hooks/useGetSettingsAndOptionsV2";
import { formInteractionOdpSetting } from "../../../services/eventServices/odpFamilyEventService";
import RobuxSettingName from "../../../../../enums/RobuxSettingName";
import { RobuxTransferApprovalsForm } from "../shared/RobuxTransferApprovalsForm";
import useManageOdpSetting from "./hooks/useManageOdpSetting";
import { trackCounter } from "./observability";
import { ParentZoneCounter } from "./observability/eventConstants";

// The on-device parent is on the child's device, so a change goes through the PIN wizard
// instead of the remote consent grant.
export const OdpRobuxApprovals = (): React.JSX.Element => {
  const { manageSetting, isManaging, revision } = useManageOdpSetting();
  const [childSettings, isChildSettingsLoading, isChildSettingsError, isChildSettingsFetching] =
    useGetSettingsAndOptionsV2();
  const { data: parentInfo } = useGetParentInfoQuery();
  const approvalSetting = childSettings?.[UserSetting.robuxTransferApprovalMode];
  const storedValue = approvalSetting?.currentValue;

  useEffect(() => {
    trackCounter(ParentZoneCounter.PageShown, { page: RobuxSettingName.Approvals });
  }, []);

  useEffect(() => {
    if (isChildSettingsError) {
      trackCounter(ParentZoneCounter.SettingsPageLoadFailed, {
        page: RobuxSettingName.Approvals,
      });
    }
  }, [isChildSettingsError]);

  const saveApprovalMode = async (newValue: RobuxTransferApprovalMode) => {
    formInteractionOdpSetting(
      RobuxSettingName.Approvals,
      UserSetting.robuxTransferApprovalMode,
      newValue,
      parentInfo?.parents,
    );
    await manageSetting({
      setting: UserSetting.robuxTransferApprovalMode,
      value: newValue,
    });
  };

  return (
    <RobuxTransferApprovalsForm
      key={revision}
      storedValue={storedValue}
      options={approvalSetting?.options}
      isLoading={isChildSettingsLoading}
      isDisabled={isManaging || isChildSettingsFetching}
      isError={isChildSettingsError || (childSettings != null && storedValue == null)}
      onChange={saveApprovalMode}
    />
  );
};

export default OdpRobuxApprovals;
