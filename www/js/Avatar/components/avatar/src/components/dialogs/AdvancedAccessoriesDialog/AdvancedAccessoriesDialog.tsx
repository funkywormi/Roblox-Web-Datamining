import React, { useEffect } from "react";
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
import type { AccoutrementAsset } from "@rbx/avatar-common";
import AvatarAccoutrementService from "../../../utils/avatarAccoutrementService";
import { AdvancedAccessorySlot } from "./AdvancedAccessoriesDialog.types";
import ConfirmUpdateAdvancedAccessoriesDialog from "../ConfirmUpdateAdvancedAccessoriesDialog";
import { useAssetManagerContext } from "../../../contexts/AssetManagerContext";
import { useCurrentlyWearingAssetsStoreContext } from "../../../contexts/CurrentlyWearingAssetsStoreContext";
import { useAvatarPageContext } from "../../../contexts/AvatarPageContext";
import { useAvatarEditingAccessContext } from "../../../contexts/AvatarEditingAccessContext";

type AdvancedAccessoriesDialogProps = {
  closeDialog: () => void;
  isOpen: boolean;
};

function AdvancedAccessoriesDialog({
  closeDialog,
  isOpen,
}: AdvancedAccessoriesDialogProps): JSX.Element {
  const { translate } = useTranslation();
  const { avatarSettings } = useAvatarPageContext();
  const { setWearingAssetsFromIdsV2 } = useAssetManagerContext();
  const { currentlyWornAssetsList } = useCurrentlyWearingAssetsStoreContext();
  const { isAvatarEditingBlocked } = useAvatarEditingAccessContext();

  const [advancedAccessorySlots, setAdvancedAccessorySlots] = React.useState<
    AdvancedAccessorySlot[]
  >([]);
  const [otherAssets, setOtherAssets] = React.useState<AccoutrementAsset[]>([]);

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = React.useState(false);

  useEffect(() => {
    const newAdvancedAccessorySlots: AdvancedAccessorySlot[] = [];
    const newOtherAssets: AccoutrementAsset[] = [];

    currentlyWornAssetsList.forEach(asset => {
      if (AvatarAccoutrementService.isAccessoryType(asset.assetType.name)) {
        newAdvancedAccessorySlots.push({
          id: asset.id,
          valid: true,
        });
      } else {
        newOtherAssets.push(asset);
      }
    });

    // fill in rest of 10 slots
    for (let i = 0; i < 10; i++) {
      if (typeof newAdvancedAccessorySlots[i] === "undefined") {
        newAdvancedAccessorySlots[i] = { id: "", valid: true };
      }
    }

    setAdvancedAccessorySlots(newAdvancedAccessorySlots);
    setOtherAssets(newOtherAssets);
  }, [currentlyWornAssetsList]);

  const catalogUrlRegex = /catalog\/(\d+)/i;
  const idRegex = /^\d+$/i;

  const isValidId = (id: string) => {
    return idRegex.exec(id) !== null;
  };

  const getIdFromCatalogUrl = (url: string) => {
    const match = catalogUrlRegex.exec(url);
    if (match?.[1]) {
      return match[1];
    }
    return null;
  };

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    slot: AdvancedAccessorySlot,
    index: number,
  ) => {
    setAdvancedAccessorySlots(prevAdvancedAccessorySlots => {
      const newId = e.target.value;
      const newAdvancedAccessorySlots = prevAdvancedAccessorySlots.map((prevSlot, i) => {
        if (i === index) {
          const catalogUrl = getIdFromCatalogUrl(newId);

          return {
            id: catalogUrl || newId,
            valid: newId === "" || isValidId(newId),
          };
        }
        return prevSlot;
      });

      return newAdvancedAccessorySlots;
    });
  };

  const onSaveClick = () => {
    setIsConfirmDialogOpen(true);
  };

  return (
    <React.Fragment>
      <Dialog
        open={isOpen}
        onOpenChange={nextOpen => {
          if (!nextOpen) closeDialog();
        }}
        size="Large"
        isModal
        hasCloseAffordance
        closeLabel={translate("Action.Close")}
      >
        <DialogContent className="advanced-accessories-dialog size-full">
          <DialogBody className="flex flex-col gap-small">
            <DialogTitle className="text-title-medium content-emphasis">
              {translate("Heading.AdvancedOptions")}
            </DialogTitle>
            {advancedAccessorySlots.map((slot, index) => (
              <TextInput
                // Positional, fixed-length (10) slots that are never reordered — index is the stable
                // key. Keying on slot.id (which onChange mutates every keystroke) remounts the input
                // and drops focus mid-typing.
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                value={String(slot.id)}
                onChange={e => {
                  onChange(e, slot, index);
                }}
                placeholder={translate("Label.AssetIDPlaceholder")}
                size="Medium"
                hasError={!slot.valid}
              />
            ))}
          </DialogBody>
          <DialogFooter className="flex gap-small justify-end">
            <Button variant="Standard" size="Medium" onClick={closeDialog}>
              {translate("Action.Cancel")}
            </Button>
            <Button
              variant="Emphasis"
              size="Medium"
              onClick={onSaveClick}
              isDisabled={isAvatarEditingBlocked}
            >
              {translate("Action.Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmUpdateAdvancedAccessoriesDialog
        closeDialog={(success?: boolean) => {
          setIsConfirmDialogOpen(false);
          if (success) {
            closeDialog();
          }
        }}
        isOpen={isConfirmDialogOpen}
        advancedAccessorySlots={advancedAccessorySlots}
        setAdvancedAccessorySlots={setAdvancedAccessorySlots}
        otherAssets={otherAssets}
        avatarSettings={avatarSettings}
        setWearingAssetsFromIdsV2={setWearingAssetsFromIdsV2}
      />
    </React.Fragment>
  );
}

export default AdvancedAccessoriesDialog;
