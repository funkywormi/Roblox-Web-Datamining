import React, { useCallback } from "react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { reportAXError } from "../../../utils/axAnalyticsService";
import avatarConstants from "../../../constants/avatarConstants";
import { AvatarType } from "../../../constants/types";
import AvatarAPIService from "../../../services/avatarAPIService";
import { useSystemFeedback } from "../../../contexts/SystemFeedbackContext";
import { useAssetManagerContext } from "../../../contexts/AssetManagerContext";
import { useAvatarPageContext } from "../../../contexts/AvatarPageContext";
import parseError from "../../../utils/parseErrorUtil";

type R6BodyTypeWarningDialogProps = {
  closeDialog: () => void;
  isOpen: boolean;
};

function R6BodyTypeWarningDialog({
  closeDialog,
  isOpen,
}: R6BodyTypeWarningDialogProps): JSX.Element {
  const { translate } = useTranslation();
  const systemFeedback = useSystemFeedback();
  const { removeLayeredClothing } = useAssetManagerContext();
  const { setAvatarType } = useAvatarPageContext();

  const confirmChange = useCallback(() => {
    const newAvatarType: AvatarType = "R6";
    setAvatarType(newAvatarType);
    AvatarAPIService.setAvatarType(newAvatarType)
      .then(() => {
        removeLayeredClothing().catch(error => {
          console.error("[R6BodyTypeWarningDialog] Error removing layered clothing", error);
        });
        closeDialog();
      })
      .catch(e => {
        reportAXError({
          itemName: "SetR15AvatarTypeError",
          counterName: "AvatarEditorError",
          log: parseError(e),
        });

        console.error(e);
        systemFeedback.error(avatarConstants.avatarType.failedToUpdate);
      });
  }, [setAvatarType, removeLayeredClothing, closeDialog, systemFeedback]);

  const modalLayout = avatarConstants.modalLayout.outfitDelete;

  const bodyTypeWarningMessage = avatarConstants.bodyTypeWarning;

  const modalParams = {
    titleText: bodyTypeWarningMessage.r6Downgrade.title,
    bodyText: bodyTypeWarningMessage.r6Downgrade.description,
    actionButtonShow: true,
    actionButtonText: bodyTypeWarningMessage.r6Downgrade.action,
    neutralButtonText: modalLayout.cancelBtnName,
    actionButtonId: modalLayout.confirmBtnId,
  };

  return (
    <Dialog
      open={!!isOpen}
      onOpenChange={nextOpen => {
        if (!nextOpen) closeDialog();
      }}
      size="Medium"
      isModal
      hasCloseAffordance
      closeLabel={translate("Action.Close")}
    >
      <DialogContent>
        <DialogBody className="flex flex-col gap-small">
          <DialogTitle className="text-title-medium content-emphasis">
            {translate(modalParams.titleText)}
          </DialogTitle>
          <span className="text-body-medium content-default">
            {translate(modalParams.bodyText)}
          </span>
        </DialogBody>
        <DialogFooter className="flex gap-small justify-end">
          <Button variant="Standard" size="Medium" onClick={closeDialog}>
            {translate(modalParams.neutralButtonText)}
          </Button>
          <Button variant="Emphasis" size="Medium" onClick={confirmChange}>
            {translate(modalParams.actionButtonText)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default R6BodyTypeWarningDialog;
