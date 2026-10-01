import React from "react";
import { useTranslation } from "react-utilities";
import { QueryStatus } from "@reduxjs/toolkit/dist/query";
import {
  buildRobuxTransferLimitsConsentValue,
  toRobuxTransferLimitsInputFromSetting,
  TRobuxTransferLimitsInput,
  useSnackbar,
  UserSetting,
} from "@rbx/user-settings";
import {
  ParentConsentType,
  TConsentData,
  TGrantConsentRequest,
} from "../../../../../types/parentConsentsTypes";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import { useGetChildTransferLimitQuery } from "../../../../apis/transferLimitsApi";
import { useInitiateConsentByParentMutation } from "../../../../apis/parentalControlsApi";
import useGetSettingsAndOptionsV2 from "../../../../apis/hooks/useGetSettingsAndOptionsV2";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import { handleChildSettingsUpdateError } from "../../../utils/successMessageUtils";
import RobuxTransferLimitsForm from "../shared/RobuxTransferLimitsForm";

const ChildRobuxTransferLimits = ({ child }: { child: TChildInfo }): JSX.Element => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();

  // The caps the parent has already saved come from user-settings, which owns
  // them; transfer-api supplies only the tier ceilings.
  const {
    data: transferLimits,
    isLoading: isTransferLimitsLoading,
    isError: isTransferLimitsError,
  } = useGetChildTransferLimitQuery(child.userId);
  const [childSettings, isChildSettingsLoading, isChildSettingsError] = useGetSettingsAndOptionsV2(
    child.userId,
  );
  const [updateChildSettings, { status: updateChildSettingsStatus }] =
    useInitiateConsentByParentMutation();

  const saveTransferLimitsHandler = async (limits: TRobuxTransferLimitsInput): Promise<void> => {
    const details: TConsentData = {
      [UserSetting.robuxTransferLimits]: buildRobuxTransferLimitsConsentValue(limits),
    };
    const updateBody: TGrantConsentRequest = {
      childUserId: child.userId,
      consentType: ParentConsentType.UpdateUserSetting,
      details,
    };
    try {
      await updateChildSettings(updateBody).unwrap();
      snackbarService.success(translate(commonTranslationConstants.successDialogMessage));
    } catch (error) {
      const errorKey = handleChildSettingsUpdateError(error, child.userId);
      if (errorKey) {
        snackbarService.warning(translate(errorKey));
      }
    }
  };

  return (
    <RobuxTransferLimitsForm
      ceilings={transferLimits}
      storedCaps={toRobuxTransferLimitsInputFromSetting(childSettings?.robuxTransferLimits)}
      isLoading={isTransferLimitsLoading || isChildSettingsLoading}
      isError={isTransferLimitsError || isChildSettingsError}
      isSaving={updateChildSettingsStatus === QueryStatus.pending}
      inputIdPrefix="robux"
      onSave={saveTransferLimitsHandler}
    />
  );
};

export default ChildRobuxTransferLimits;
