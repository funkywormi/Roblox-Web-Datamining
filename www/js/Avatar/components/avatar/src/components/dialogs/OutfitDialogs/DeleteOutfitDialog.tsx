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
import { CatalogOutfitItem } from "../../../avatar.types";
import avatarConstants from "../../../constants/avatarConstants";
import AvatarAPIService from "../../../services/avatarAPIService";
import { useSystemFeedback } from "../../../contexts/SystemFeedbackContext";
import parseError from "../../../utils/parseErrorUtil";
import { trackAvatarEditorClick, AvatarEditorTrackingEvents } from "../../../utils/axTracking";

type DeleteOutfitDialogProps = {
  outfit: CatalogOutfitItem | null;
  closeDialog: () => void;
  deleteOutfitFromDataList: (outfitId: number) => void;
};

function DeleteOutfitDialog({
  outfit,
  closeDialog,
  deleteOutfitFromDataList,
}: DeleteOutfitDialogProps): JSX.Element {
  const { translate } = useTranslation();
  const systemFeedback = useSystemFeedback();
  const outfitCostumeMessage = avatarConstants.outfits.characterMessages;
  const [hasError, setHasError] = React.useState<boolean>(false);

  const handleDeleteOutfitError = useCallback((e: any) => {
    console.error(e);
    reportAXError({
      itemName: "DeleteOutfitError",
      counterName: "AvatarEditorError",
      log: parseError(e),
    });
    setHasError(true);
  }, []);

  const handleClose = useCallback(() => {
    setHasError(false);
    closeDialog();
  }, [closeDialog]);

  const deleteOutfit = useCallback(() => {
    if (!outfit) {
      return;
    }

    try {
      AvatarAPIService.deleteOutfit(outfit.id)
        .then(
          () => {
            trackAvatarEditorClick(AvatarEditorTrackingEvents.OutfitDeleted, {
              outfitId: outfit.id,
              outfitType: outfit.outfitType,
            });
            systemFeedback.success(outfitCostumeMessage.successfulDelete);
            deleteOutfitFromDataList(outfit.id);
            handleClose();
          },
          e => {
            handleDeleteOutfitError(e);
          },
        )
        .catch((e: unknown) => {
          handleDeleteOutfitError(e);
        });
    } catch (e: unknown) {
      handleDeleteOutfitError(e);
    }
  }, [
    outfit,
    systemFeedback,
    outfitCostumeMessage.successfulDelete,
    deleteOutfitFromDataList,
    handleClose,
    handleDeleteOutfitError,
  ]);

  const modalLayout = avatarConstants.modalLayout.outfitDelete;
  // Need to update to character
  const outfitSingular = translate("Label.Outfit");

  const modalParams = {
    titleText: modalLayout.titlePrefix(outfitSingular),
    bodyText: modalLayout.bodyText(outfitSingular),
    actionButtonShow: true,
    actionButtonText: modalLayout.confirmBtnName,
    neutralButtonText: modalLayout.cancelBtnName,
    actionButtonId: modalLayout.confirmBtnId,
  };

  return (
    <Dialog
      open={!!outfit}
      onOpenChange={nextOpen => {
        if (!nextOpen) handleClose();
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
          {hasError && (
            <span className="text-body-small content-system-alert">
              {translate(outfitCostumeMessage.errorDeletingOutfit)}
            </span>
          )}
        </DialogBody>
        <DialogFooter className="flex gap-small justify-end">
          <Button variant="Standard" size="Medium" onClick={handleClose}>
            {translate(modalParams.neutralButtonText)}
          </Button>
          <Button variant="Alert" size="Medium" onClick={deleteOutfit}>
            {translate(modalParams.actionButtonText)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteOutfitDialog;
