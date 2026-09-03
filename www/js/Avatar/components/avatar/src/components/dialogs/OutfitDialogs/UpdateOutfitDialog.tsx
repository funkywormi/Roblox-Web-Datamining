import React, { useCallback, useState } from "react";
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
import getItemThumbnailAndLink from "../../../utils/assetManager.helpers";
import { useSystemFeedback } from "../../../contexts/SystemFeedbackContext";
import { useAssetManagerContext } from "../../../contexts/AssetManagerContext";
import parseError from "../../../utils/parseErrorUtil";
import { trackAvatarEditorClick, AvatarEditorTrackingEvents } from "../../../utils/axTracking";

type UpdateOutfitDialogProps = {
  outfit: CatalogOutfitItem | null;
  handleClose: () => void;
  updateOutfitInDataList: (updatedOutfit: CatalogOutfitItem) => void;
};

function UpdateOutfitDialog({
  outfit,
  handleClose,
  updateOutfitInDataList,
}: UpdateOutfitDialogProps): JSX.Element {
  const { translate } = useTranslation();
  const systemFeedback = useSystemFeedback();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { constructLayeredClothingMetadata } = useAssetManagerContext();

  const updateOutfit = useCallback(() => {
    if (!outfit) {
      return;
    }

    const outfitCostumeMessage = avatarConstants.outfits.characterMessages;

    // TODO provide handles for getting body colors and asset IDs instead of requesting again
    const getAvatarRequest = AvatarAPIService.getAvatarV2(false);
    getAvatarRequest
      .then(result => {
        const avatarDetails = result;

        const { bodyColor3s, scales, equippedBackgroundAssetId } = avatarDetails;
        const assets = constructLayeredClothingMetadata(avatarDetails.assets);
        const scale = scales;

        const outfitContents = {
          bodyColor3s,
          assets,
          scale,
          // Persist the current profile background with the outfit (`0` = no background).
          backgroundAssetId: equippedBackgroundAssetId ?? 0,
        };

        AvatarAPIService.patchOutfitV3(outfit.id, outfitContents).then(
          patchedOutfitResult => {
            const updatedItem: CatalogOutfitItem = {
              ...outfit,
              ...getItemThumbnailAndLink<CatalogOutfitItem>(outfit),
              // Bump the version so the card's thumbnail cache key changes and the
              // Thumbnail2d re-requests a fresh image reflecting the saved outfit.
              version: (outfit.version ?? 0) + 1,
            };
            updateOutfitInDataList(updatedItem);
            trackAvatarEditorClick(AvatarEditorTrackingEvents.OutfitEdited, {
              action: "update",
              outfitId: outfit.id,
              outfitType: outfit.outfitType,
            });
            handleClose();
            systemFeedback.success(outfitCostumeMessage.successfulUpdate);
          },
          data => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const outfitDoesntExist = data?.errors?.[0]?.code === 1;
            if (outfitDoesntExist) {
              setErrorMessage(outfitCostumeMessage.updateFailedOutfitDelete);
            } else {
              reportAXError({
                itemName: "UpdateOutfitError",
                counterName: "AvatarEditorError",
                log: parseError(data),
              });
              setErrorMessage(outfitCostumeMessage.errorUpdatingOutfit);
            }
          },
        );
      })
      .catch(e => {
        reportAXError({
          itemName: "UpdateOutfitError",
          counterName: "AvatarEditorError",
          log: parseError(e),
        });
        setErrorMessage(outfitCostumeMessage.errorUpdatingOutfit);
      });
  }, [
    outfit,
    constructLayeredClothingMetadata,
    systemFeedback,
    handleClose,
    updateOutfitInDataList,
  ]);

  const modalLayout = avatarConstants.modalLayout.outfitUpdate;
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
          {errorMessage && (
            <span className="text-body-small content-system-alert">{translate(errorMessage)}</span>
          )}
        </DialogBody>
        <DialogFooter className="flex gap-small justify-end">
          <Button variant="Standard" size="Medium" onClick={handleClose}>
            {translate(modalParams.neutralButtonText)}
          </Button>
          <Button variant="Emphasis" size="Medium" onClick={updateOutfit}>
            {translate(modalParams.actionButtonText)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UpdateOutfitDialog;
