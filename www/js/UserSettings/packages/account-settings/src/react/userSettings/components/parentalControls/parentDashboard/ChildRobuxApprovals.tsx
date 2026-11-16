import React from "react";
import { useTranslation } from "react-utilities";
import {
  RobuxTransferApprovalMode,
  TUpdateUserSettingValueRequest,
  UserSetting,
  useSnackbar,
} from "@rbx/user-settings";
import { useUpdateUserSettingValueV2Mutation } from "../../../../apis/userSettingsApi";
import useGetSettingsAndOptionsV2 from "../../../../apis/hooks/useGetSettingsAndOptionsV2";
import {
  getSuccessMessageKeyForUserSettingsUpdate,
  handleChildSettingsUpdateError,
} from "../../../utils/successMessageUtils";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import { RobuxTransferApprovalsForm } from "../shared/RobuxTransferApprovalsForm";

const ChildRobuxApprovals = ({ child }: { child: TChildInfo }): React.JSX.Element => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();
  const [settingsAndOptions, isSettingsLoading, isSettingsError] = useGetSettingsAndOptionsV2(
    child.userId,
  );
  const [updateSettingValue, { isLoading: isSaving }] = useUpdateUserSettingValueV2Mutation();
  const approvalSetting = settingsAndOptions?.[UserSetting.robuxTransferApprovalMode];
  const storedValue = approvalSetting?.currentValue ?? RobuxTransferApprovalMode.AlwaysAsk;

  const saveApprovalMode = async (newValue: RobuxTransferApprovalMode) => {
    const updateBody: TUpdateUserSettingValueRequest = {
      childUserId: child.userId,
      setting: UserSetting.robuxTransferApprovalMode,
      value: newValue,
    };
    try {
      const result = await updateSettingValue(updateBody).unwrap();
      const successMessageKey = getSuccessMessageKeyForUserSettingsUpdate(updateBody, result);
      if (successMessageKey) {
        snackbarService.success(translate(successMessageKey));
      }
    } catch (error) {
      const errorKey = handleChildSettingsUpdateError(
        error,
        child.userId,
        UserSetting.robuxTransferApprovalMode,
      );
      if (errorKey) {
        snackbarService.warning(translate(errorKey));
      }
      // The shared form puts the radios back on the saved mode when this rejects.
      throw error;
    }
  };

  return (
    <RobuxTransferApprovalsForm
      storedValue={storedValue}
      options={approvalSetting?.options}
      isLoading={isSettingsLoading}
      isError={isSettingsError}
      isDisabled={isSaving}
      onChange={saveApprovalMode}
    />
  );
};

export default ChildRobuxApprovals;
