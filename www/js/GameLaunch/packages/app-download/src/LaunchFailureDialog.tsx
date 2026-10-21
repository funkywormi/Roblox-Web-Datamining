import type React from "react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";
import { useTranslations } from "@rbx/www-common/i18n";
import { launchFailureDialogNamespaces } from "./constants";

/**
 * Shown when the client didn't start after a launch: an error title and body with one OK button.
 * Needs a `use-intl` provider with `launchFailureDialogNamespaces`.
 */
const LaunchFailureDialog = ({ unmount }: { unmount: () => void }): React.ReactElement => {
  const [visitGame, controls] = launchFailureDialogNamespaces;
  const tVisitGame = useTranslations(visitGame);
  const tControls = useTranslations(controls);

  return (
    <Dialog
      hasCloseAffordance={false}
      isModal
      open
      size="Small"
      onOpenChange={nextOpen => {
        if (!nextOpen) unmount();
      }}
    >
      <DialogContent>
        <DialogBody className="flex flex-col gap-small">
          <DialogTitle className="text-heading-small content-emphasis padding-none">
            {tVisitGame("Heading.ErrorStartingGame")}
          </DialogTitle>
          <p className="text-body-medium content-default">
            {tVisitGame("Response.Dialog.ErrorLaunching")}
          </p>
        </DialogBody>
        <DialogFooter className="flex">
          <Button className="grow" variant="Emphasis" size="Medium" onClick={unmount}>
            {tControls.has("Action.OK") ? tControls("Action.OK") : "OK"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LaunchFailureDialog;
