import { useTranslation } from "@rbx/core-scripts/react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";

import type { FC } from "react";

/** Figma: Roblox Plus VAS MVP — benefit detail (node 25048-147651): narrow surface card, left-aligned stack, Ok CTA. */
export type BenefitDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: string;
};

const BenefitDetailDialog: FC<BenefitDetailDialogProps> = ({ open, onOpenChange, title, body }) => {
  const { translate } = useTranslation();

  return (
    <Dialog
      closeLabel={translate("Action.Close")}
      hasCloseAffordance
      isModal
      open={open}
      size="Small"
      type="Default"
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className="stroke-standard stroke-default flex flex-col items-start"
        style={{ width: "100%", maxWidth: 320 }}
      >
        <DialogBody className="width-full gap-small padding-top-medium padding-x-xlarge padding-bottom-large flex flex-col items-start">
          <DialogTitle className="margin-none text-heading-small content-emphasis text-align-x-start">
            {title}
          </DialogTitle>
          <p className="margin-none text-body-medium content-default text-align-x-start whitespace-pre-line">
            {body}
          </p>
        </DialogBody>
        <DialogFooter className="width-full">
          <Button
            className="width-full"
            size="Medium"
            variant="Emphasis"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            {translate("Action.OK")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BenefitDetailDialog;
