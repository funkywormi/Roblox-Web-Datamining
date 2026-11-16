import type React from "react";
import { AppIcon } from "@rbx/branding-assets";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";
import { useTranslations } from "@rbx/www-common/i18n";
import "@rbx/branding-assets/css/app_icons.css";
import "./DownloadDialog.css";

type TPlayOnWebDialogProps = {
  title: string;
  description?: string;
  isChecking?: boolean;
  onPlayOnWeb: () => void;
  onClose: () => void;
};

const PlayOnWebDialog = ({
  title,
  description,
  isChecking = false,
  onPlayOnWeb,
  onClose,
}: TPlayOnWebDialogProps): React.ReactElement => {
  const tExperienceDetails = useTranslations("Feature.ExperienceDetails");
  const tControls = useTranslations("CommonUI.Controls");

  return (
    <Dialog
      hasCloseAffordance
      closeLabel={tControls("Action.Close")}
      isModal
      open
      size="Medium"
      onOpenChange={onClose}
    >
      <DialogContent className="download-dialog">
        <DialogBody className="flex flex-col items-center gap-xlarge">
          <AppIcon className="size-1600" />
          <DialogTitle className="text-heading-small padding-x-xxlarge padding-y-none text-align-x-center">
            {title}
          </DialogTitle>
          {description && <p className="text-body-medium text-align-x-center">{description}</p>}
        </DialogBody>
        <DialogFooter className="flex">
          <Button
            variant="Emphasis"
            size="Medium"
            className="grow"
            isLoading={isChecking}
            onClick={() => {
              if (isChecking) {
                return;
              }
              onPlayOnWeb();
              onClose();
            }}
          >
            {tExperienceDetails.dynamic("PlayButtonText.PlayOnWeb", undefined, "Play in browser")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlayOnWebDialog;
