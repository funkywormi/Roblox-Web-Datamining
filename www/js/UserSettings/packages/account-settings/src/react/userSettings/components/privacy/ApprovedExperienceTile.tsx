import React, { useCallback } from "react";
import { useTranslation } from "react-utilities";
import { useSnackbar } from "@rbx/user-settings";
import { TChildInfo } from "../../../../types/childrenInfoTypes";
import GameTile, { TGameData } from "../parentalControls/parentDashboard/GameTile";
import { useManageChildBlockedExperiencesMutation } from "../../../apis/experienceBlockingApi";
import {
  ManagementAction,
  ParentConsentType,
  TGrantConsentRequest,
} from "../../../../types/parentConsentsTypes";
import parentalControlsTranslationConstants from "../../constants/contentConstants/parentalControlsTranslationConstants";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";
import useSettingsModal from "../../../common/hooks/modals/useSettingsModal";

const ApprovedExperienceTile = ({
  gameData,
  child,
}: {
  gameData: TGameData;
  child: TChildInfo;
}): JSX.Element => {
  const { translate } = useTranslation();
  const { approvedExperiences } = parentalControlsTranslationConstants;
  const { snackbarService } = useSnackbar();
  const [manageBlockedExperiences] = useManageChildBlockedExperiencesMutation();

  const handleRevoke = useCallback(async () => {
    try {
      const request: TGrantConsentRequest = {
        childUserId: child.userId,
        consentType: ParentConsentType.ManageExperience,
        details: {
          experienceManagementAction: ManagementAction.RevokeApproval,
          universeId: gameData.universeId,
        },
      };
      await manageBlockedExperiences(request).unwrap();
      snackbarService.success(
        translate(approvedExperiences.revokeSuccess, {
          experienceName: gameData.name,
        }),
      );
    } catch {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    }
  }, [child, gameData, manageBlockedExperiences, snackbarService, translate, approvedExperiences]);

  const [confirmRevokeModal, confirmRevokeModalService] = useSettingsModal({
    titleResourceId: approvedExperiences.confirmRevoke,
    bodyResourceId: approvedExperiences.confirmRevokeExperience,
    actionButtonTextResourceId: approvedExperiences.revokeButton,
    neutralButtonTextResourceId: commonTranslationConstants.cancel,
    onAction: handleRevoke,
  });

  return (
    <React.Fragment>
      <GameTile
        gameData={gameData}
        showPopover
        child={child}
        onRevokeApproval={confirmRevokeModalService.open}
      />
      {confirmRevokeModal}
    </React.Fragment>
  );
};

export default ApprovedExperienceTile;
