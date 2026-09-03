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
import type { AccoutrementAsset } from "@rbx/avatar-common";
import avatarConstants from "../../../constants/avatarConstants";
import { useAssetManagerContext } from "../../../contexts/AssetManagerContext";
import { useAvatarPageContext } from "../../../contexts/AvatarPageContext";

type LayeredClothingBodyTypeWarningDialogProps = {
  closeDialog: () => void;
  assetToWear: AccoutrementAsset | null;
};

function LayeredClothingBodyTypeWarningDialog({
  closeDialog,
  assetToWear,
}: LayeredClothingBodyTypeWarningDialogProps): JSX.Element {
  const { translate } = useTranslation();
  const { wearAsset } = useAssetManagerContext();
  const { setAvatarType } = useAvatarPageContext();

  const confirmChange = useCallback(() => {
    if (!assetToWear) {
      return;
    }

    setAvatarType("R15");
    wearAsset(assetToWear, false).catch(() => {
      // Error handled elsewhere
    });
  }, [assetToWear, setAvatarType, wearAsset]);

  const modalLayout = avatarConstants.modalLayout.outfitDelete;

  const bodyTypeWarningMessage = avatarConstants.bodyTypeWarning;

  const modalParams = {
    titleText: bodyTypeWarningMessage.r15Upgrade.title,
    bodyText: bodyTypeWarningMessage.r15Upgrade.description,
    actionButtonShow: true,
    actionButtonText: bodyTypeWarningMessage.r15Upgrade.action,
    neutralButtonText: modalLayout.cancelBtnName,
    actionButtonId: modalLayout.confirmBtnId,
  };

  return (
    <Dialog
      open={!!assetToWear}
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

export default LayeredClothingBodyTypeWarningDialog;
