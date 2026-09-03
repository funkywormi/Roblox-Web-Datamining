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
import hasInvalidOutfitName from "../../../utils/outfitsMenu.utils";
import { useSystemFeedback } from "../../../contexts/SystemFeedbackContext";
import { useAssetManagerContext } from "../../../contexts/AssetManagerContext";
import parseError from "../../../utils/parseErrorUtil";
import { trackAvatarEditorClick, AvatarEditorTrackingEvents } from "../../../utils/axTracking";

type CreateOutfitDialogProps = {
  closeDialog: () => void;
  open: boolean;
  refreshOutfits: () => void;
};

function CreateOutfitDialog({
  closeDialog,
  open,
  refreshOutfits,
}: CreateOutfitDialogProps): JSX.Element {
  const { translate } = useTranslation();
  const [newName, setNewName] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);
  const systemFeedback = useSystemFeedback();
  const { constructLayeredClothingMetadata } = useAssetManagerContext();

  const isCreateOutfitDisabled = useMemo(() => {
    return !newName.trim();
  }, [newName]);

  const handleCreateOutfitError = useCallback(
    (e: any) => {
      console.error(e);
      const outfitCostumeMessage = avatarConstants.outfits.characterMessages;

      // Structural type (only `.code` is read) so this dialog does not depend on
      // `@rbx/core-scripts/http` on the Next.js path.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const errorResponse: { code?: string } = e?.errors?.[0] || e;
      const hasMaxOutfits =
        errorResponse.code === avatarConstants.outfits.outfitErrorCodes.maxOutfits.toString();
      if (hasMaxOutfits) {
        setError(translate(outfitCostumeMessage.maxNumberOfOutfits));
      } else {
        const invalidOutfitName = hasInvalidOutfitName(e, false);
        if (invalidOutfitName) {
          setError(translate(outfitCostumeMessage.invalidOutfitName));
        } else {
          reportAXError({
            itemName: "CreateOutfitError",
            counterName: "AvatarEditorError",
            log: parseError(error),
          });

          setError(translate(outfitCostumeMessage.errorCreatingOutfit));
        }
      }
    },
    [error, translate],
  );

  const handleClose = useCallback(() => {
    setNewName("");
    setError(null);
    closeDialog();
  }, [setNewName, setError, closeDialog]);

  const createOutfit = useCallback(() => {
    const outfitCostumeMessage = avatarConstants.outfits.characterMessages;

    // TODO provide handles for getting body colors and asset IDs instead of requesting again
    const getAvatarRequest = AvatarAPIService.getAvatarV2(false);
    getAvatarRequest
      .then(result => {
        const avatarDetails = result;
        const { bodyColor3s, scales, playerAvatarType, equippedBackgroundAssetId } = avatarDetails;
        const assets = constructLayeredClothingMetadata(avatarDetails.assets);
        // Persist the current profile background with the outfit (`0` = no background) so
        // equipping the outfit later restores the same background.
        const backgroundAssetId = equippedBackgroundAssetId ?? 0;

        AvatarAPIService.createOutfitV3(
          newName,
          bodyColor3s,
          assets,
          scales,
          playerAvatarType,
          backgroundAssetId,
        )
          .then(
            () => {
              trackAvatarEditorClick(AvatarEditorTrackingEvents.OutfitCreated, {
                avatarType: playerAvatarType,
              });
              systemFeedback.success(outfitCostumeMessage.successfulCreate);
              refreshOutfits();
              handleClose();
            },
            data => {
              handleCreateOutfitError(data);
            },
          )
          .catch(e => {
            handleCreateOutfitError(e);
          });
      })
      .catch(e => {
        handleCreateOutfitError(e);
      });
  }, [
    constructLayeredClothingMetadata,
    newName,
    systemFeedback,
    refreshOutfits,
    handleClose,
    handleCreateOutfitError,
  ]);

  const modalLayout = avatarConstants.modalLayout.outfitUpdate;

  const outfitCostumeMessage = avatarConstants.outfits.characterMessages;

  const modalParams = {
    titleText: outfitCostumeMessage.createOutfitTitle,
    bodyText: outfitCostumeMessage.createOutfitDescription,
    actionButtonShow: true,
    actionButtonText: outfitCostumeMessage.createOutfitButton,
    inputPlaceholderText: outfitCostumeMessage.nameInputPlaceholder,
    neutralButtonText: modalLayout.cancelBtnName,
    actionButtonId: modalLayout.confirmBtnId,
  };

  return (
    <Dialog
      open={open}
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
              if (e.key === "Enter" && !isCreateOutfitDisabled) {
                createOutfit();
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
            onClick={createOutfit}
            isDisabled={isCreateOutfitDisabled}
          >
            {translate(modalParams.actionButtonText)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateOutfitDialog;
