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
import { reportAXError } from "../../utils/axAnalyticsService";
import AvatarAccoutrementService from "../../utils/avatarAccoutrementService";
import { assetTypeLabels } from "../../constants/avatarAssetTypeNames";
import avatarConstants from "../../constants/avatarConstants";
import { TAssetItemDetails } from "../../constants/types";
import { sendAdvancedEditSaveEvent } from "../../eventService";
import { AvatarSettings } from "../../metadataRequest";
import AvatarAPIService, {
  SetWearingAssetsResponse,
  PostItemDetailsResponse,
  getInvalidAssetIds,
} from "../../services/avatarAPIService";
import { AdvancedAccessorySlot } from "./AdvancedAccessoriesDialog/AdvancedAccessoriesDialog.types";
import { useSystemFeedback } from "../../contexts/SystemFeedbackContext";
import { useAvatarTabsContext } from "../../contexts/AvatarTabsContext";
import parseError from "../../utils/parseErrorUtil";

type ConfirmUpdateAdvancedAccessoriesDialogProps = {
  closeDialog: (success?: boolean) => void;
  isOpen: boolean;
  advancedAccessorySlots: AdvancedAccessorySlot[];
  setAdvancedAccessorySlots: React.Dispatch<React.SetStateAction<AdvancedAccessorySlot[]>>;
  otherAssets: AccoutrementAsset[];
  avatarSettings: AvatarSettings | undefined;
  setWearingAssetsFromIdsV2: (
    assets: AccoutrementAsset[],
    reloadAssetsAfterSuccess: boolean,
  ) => Promise<SetWearingAssetsResponse>;
};

function ConfirmUpdateAdvancedAccessoriesDialog({
  closeDialog,
  isOpen,
  advancedAccessorySlots,
  setAdvancedAccessorySlots,
  otherAssets,
  avatarSettings,
  setWearingAssetsFromIdsV2,
}: ConfirmUpdateAdvancedAccessoriesDialogProps): JSX.Element {
  const { translate } = useTranslation();
  const systemFeedback = useSystemFeedback();
  const { selectedSubcategory } = useAvatarTabsContext();

  const validateAdvancedAccessories = useCallback(
    (assetDetails: PostItemDetailsResponse): boolean => {
      if (!avatarSettings?.LCEnabledInEditorAndCatalog) {
        return true;
      }
      const limitedAssetTypeQuantities: Record<number, number> = {};

      let result = true;

      for (const asset of assetDetails.data) {
        const { assetType } = asset as TAssetItemDetails;

        if (AvatarAccoutrementService.getAdvancedAccessoryLimit(assetType) !== undefined) {
          if (limitedAssetTypeQuantities[assetType] === undefined) {
            limitedAssetTypeQuantities[assetType] = 0;
          }
          limitedAssetTypeQuantities[assetType] += 1;

          if (
            limitedAssetTypeQuantities[assetType] >
            AvatarAccoutrementService.getAdvancedAccessoryLimit(assetType)
          ) {
            const error = translate("Message.ErrorAdvancedSave", {
              limitAmount: AvatarAccoutrementService.getAdvancedAccessoryLimit(assetType),
              assetType: assetTypeLabels[assetType],
            });

            systemFeedback.error(error);
            result = false;
            break;
          }
        } else if (AvatarAccoutrementService.isLayeredClothing(assetType)) {
          const error = translate("Message.ErrorAdvancedUnsupportedAssetType", {
            assetType: assetTypeLabels[assetType],
          });

          systemFeedback.error(error);
          result = false;
          break;
        }
      }

      return result;
    },
    [avatarSettings?.LCEnabledInEditorAndCatalog, systemFeedback, translate],
  );

  const onSaveAdvancedAccessories = useCallback(
    submitFunc => {
      // validate all inputs
      const assetIds: (string | number)[] = [];
      const assets: (AccoutrementAsset | AdvancedAccessorySlot)[] = [];
      advancedAccessorySlots.forEach(slot => {
        if (slot.id !== "") {
          assetIds.push(slot.id);
          assets.push(slot);
        }
      });
      // add other assets
      otherAssets.forEach(asset => {
        assets.push(asset);
      });

      const items: { assetId: number }[] = [];
      assetIds.forEach(asset => {
        const item = {
          assetId: asset as number,
        };
        items.push(item);
      });

      AvatarAPIService.postItemDetails(items, "Asset").then(
        postItemDetailsResponse => {
          const assetDetails = postItemDetailsResponse;
          if (validateAdvancedAccessories(assetDetails)) {
            setWearingAssetsFromIdsV2(assets as AccoutrementAsset[], true).then(
              response => {
                let success = false;
                // leave the modal open and update the form fields to show valid/invalid.
                // getInvalidAssetIds tolerates both the legacy `invalidAssetIds` (v2) and the
                // consolidated PATCH /v4/avatar `invalidAssets` shapes.
                const invalidAssetIds = getInvalidAssetIds(response);
                if (invalidAssetIds.length > 0) {
                  // mark them as dirty
                  setAdvancedAccessorySlots(prevAdvancedAccessorySlots => {
                    return prevAdvancedAccessorySlots.map((accessorySlot, index) => {
                      const valid =
                        accessorySlot.id === "" ||
                        !invalidAssetIds.includes(parseInt(accessorySlot.id as string, 10));
                      // update valid state
                      return {
                        ...accessorySlot,
                        valid,
                      };
                    });
                  });

                  // Did save succeed - false
                  sendAdvancedEditSaveEvent(
                    assetIds as string[],
                    selectedSubcategory?.assetType,
                    false,
                  );
                  success = true;
                  systemFeedback.success(avatarConstants.assets.savedAdvancedAccessories);
                  sendAdvancedEditSaveEvent(
                    assetIds as string[],
                    selectedSubcategory?.assetType,
                    true,
                  );
                }
                closeDialog(success);
              },
              response => {
                reportAXError({
                  itemName: "SaveAdvancedAccessoriesPostItemDetailsError",
                  counterName: "AvatarEditorError",
                  log: parseError(response),
                });

                // something really wrong
                // Did save succeed - false
                systemFeedback.error(avatarConstants.assets.errorUpdatingItems);
                sendAdvancedEditSaveEvent(
                  assetIds as string[],
                  selectedSubcategory?.assetType,
                  false,
                );
                closeDialog();
              },
            );
          }
        },
        response => {
          reportAXError({
            itemName: "SaveAdvancedAccessoriesSetWearingIdsError",
            counterName: "AvatarEditorError",
            log: parseError(response),
          });
          systemFeedback.error(avatarConstants.assets.errorUpdatingItems);
          closeDialog();
        },
      );
    },
    [
      advancedAccessorySlots,
      closeDialog,
      otherAssets,
      selectedSubcategory?.assetType,
      setAdvancedAccessorySlots,
      setWearingAssetsFromIdsV2,
      systemFeedback,
      validateAdvancedAccessories,
    ],
  );

  const modalLayout = avatarConstants.modalLayout.advancedAccessoriesDoubleCheck;

  const modalParams = {
    titleText: modalLayout.title,
    bodyText: modalLayout.bodyText,
    actionButtonShow: true,
    actionButtonText: modalLayout.confirmBtnName,
    neutralButtonText: modalLayout.cancelBtnName,
  };

  return (
    <Dialog
      open={isOpen}
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
            {translate("Heading.AdvancedOptions")}
          </DialogTitle>
          <span className="text-body-medium content-default">
            {translate(modalParams.bodyText)}
          </span>
        </DialogBody>
        <DialogFooter className="flex gap-small justify-end">
          <Button
            variant="Standard"
            size="Medium"
            onClick={() => {
              closeDialog();
            }}
          >
            {translate(modalParams.neutralButtonText)}
          </Button>
          <Button variant="Emphasis" size="Medium" onClick={onSaveAdvancedAccessories}>
            {translate(modalParams.actionButtonText)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmUpdateAdvancedAccessoriesDialog;
