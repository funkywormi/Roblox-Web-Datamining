import React, { useCallback, useMemo } from "react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
  TextInput,
} from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { reportAXError } from "../../../utils/axAnalyticsService";
import avatarConstants from "../../../constants/avatarConstants";
import AvatarAPIService from "../../../services/avatarAPIService";
import { CatalogOutfitItem } from "../../../avatar.types";
import hasInvalidOutfitName from "../../../utils/outfitsMenu.utils";
import { useSystemFeedback } from "../../../contexts/SystemFeedbackContext";
import parseError from "../../../utils/parseErrorUtil";
import { trackAvatarEditorClick, AvatarEditorTrackingEvents } from "../../../utils/axTracking";

type RenameOutfitDialogProps = {
  outfit: CatalogOutfitItem | null;
  closeDialog: () => void;
  updateOutfitNameInDataList: (outfitId: number, newName: string) => void;
};

function RenameOutfitDialog({
  outfit,
  closeDialog,
  updateOutfitNameInDataList,
}: RenameOutfitDialogProps): JSX.Element {
  const { translate } = useTranslation();
  const [newName, setNewName] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);
  const systemFeedback = useSystemFeedback();
  const isRenameOutfitDisabled = useMemo(() => {
    return !newName.trim();
  }, [newName]);

  const handleRenameOutfitError = useCallback(
    (e: any) => {
      const outfitCostumeMessage = avatarConstants.outfits.characterMessages;
      const invalidOutfitName = hasInvalidOutfitName(e, true);
      if (invalidOutfitName) {
        setError(translate(outfitCostumeMessage.invalidOutfitName));
      } else {
        reportAXError({
          itemName: "RenameOutfitError",
          counterName: "AvatarEditorError",
          log: parseError(e),
        });

        setError(translate(outfitCostumeMessage.errorRenamingOutfit));
      }
    },
    [translate],
  );

  const handleClose = useCallback(() => {
    setNewName("");
    setError(null);
    closeDialog();
  }, [setNewName, setError, closeDialog]);

  const renameOutfit = useCallback(() => {
    if (!outfit) {
      return;
    }

    const outfitCostumeMessage = avatarConstants.outfits.characterMessages;
    const outfitContents = { name: newName };

    try {
      const patchAvatarRequest = AvatarAPIService.patchOutfitV3(outfit.id, outfitContents);
      patchAvatarRequest
        .then(
          result => {
            // If the API responded with a filtered version of the name, use the filtered name
            // Otherwise, use the new name inputted by the user
            const updatedName: string = result.name || newName;
            updateOutfitNameInDataList(outfit.id, updatedName);

            trackAvatarEditorClick(AvatarEditorTrackingEvents.OutfitEdited, {
              action: "rename",
              outfitId: outfit.id,
            });

            // show the success feedback message
            systemFeedback.success(outfitCostumeMessage.successfulRename);
            handleClose();
          },
          e => {
            handleRenameOutfitError(e);
          },
        )
        .catch(e => {
          handleRenameOutfitError(e);
        });
    } catch (e: unknown) {
      handleRenameOutfitError(e);
    }
  }, [
    outfit,
    newName,
    updateOutfitNameInDataList,
    systemFeedback,
    handleClose,
    handleRenameOutfitError,
  ]);

  const modalLayout = avatarConstants.modalLayout.outfitDelete;

  const outfitCostumeMessage = avatarConstants.outfits.characterMessages;

  const modalParams = {
    titleText: outfitCostumeMessage.renameOutfitTitle,
    bodyText: outfitCostumeMessage.renameOutfitDescription,
    inputPlaceholderText: outfitCostumeMessage.nameInputPlaceholder,
    actionButtonShow: true,
    actionButtonText: outfitCostumeMessage.renameOutfitButton,
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
          <TextInput
            id="new-outfit-name"
            size="Medium"
            placeholder={translate(modalParams.inputPlaceholderText)}
            value={newName}
            onChange={e => {
              setNewName(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={e => {
              if (e.key === "Enter" && !isRenameOutfitDisabled) {
                renameOutfit();
              }
            }}
            hasError={!!error}
            error={error ?? undefined}
          />
        </DialogBody>
        <DialogFooter className="flex gap-small justify-end">
          <Button variant="Standard" size="Medium" onClick={handleClose}>
            {translate(modalParams.neutralButtonText)}
          </Button>
          <Button
            variant="Emphasis"
            size="Medium"
            onClick={renameOutfit}
            isDisabled={isRenameOutfitDisabled}
          >
            {translate(modalParams.actionButtonText)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RenameOutfitDialog;
