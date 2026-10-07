import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";
import { useTranslations } from "@rbx/www-common/i18n";
import EmotesRadialMenu from "./EmotesRadialMenu";
import { CatalogItem } from "../../../avatar.types";

type EquipEmotesDialogProps = {
  closeDialog: () => void;
  isOpen: boolean;
  selectedItem: CatalogItem | undefined;
};

function EquipEmotesDialog({
  closeDialog,
  isOpen,
  selectedItem,
}: EquipEmotesDialogProps): JSX.Element {
  const translate = useTranslations("Feature.Avatar");
  return (
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
      <DialogContent>
        <DialogBody className="flex flex-col gap-small">
          <DialogTitle className="text-title-medium content-emphasis">
            {translate("Heading.EquipEmotes")}
          </DialogTitle>
          <EmotesRadialMenu selectedItem={selectedItem} />
        </DialogBody>
        <DialogFooter className="flex gap-small justify-end">
          <Button variant="Standard" size="Medium" onClick={closeDialog}>
            {translate("Action.Close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EquipEmotesDialog;
