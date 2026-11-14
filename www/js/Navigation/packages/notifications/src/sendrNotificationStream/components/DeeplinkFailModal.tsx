import React from "react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";
import { useNotificationLocalization } from "../context/NotificationsLocalization";
import { getNotificationStreamHost } from "../../notificationStreamData/streamHost";
import { getFlaggedMuiModalArms } from "../mui/muiModalArms";

type DeeplinkFailModalProps = {
  show: boolean;
  closeCallback: () => void;
};

const DeeplinkFailModalContent = ({ show, closeCallback }: DeeplinkFailModalProps) => {
  const translate = useNotificationLocalization();
  const MuiDeeplinkFailModal = getFlaggedMuiModalArms()?.DeeplinkFailModal;
  if (MuiDeeplinkFailModal) {
    return <MuiDeeplinkFailModal show={show} closeCallback={closeCallback} translate={translate} />;
  }
  return (
    <Dialog
      open={show}
      onOpenChange={open => {
        if (!open) {
          closeCallback();
        }
      }}
      type="Default"
      size="Medium"
      isModal
      hasCloseAffordance={false}
    >
      <DialogContent>
        <DialogBody className="flex flex-col gap-y-small">
          <DialogTitle className="text-heading-medium margin-none">
            {translate("Heading.JoinFailed")}
          </DialogTitle>
          <div className="text-body-medium content-default">
            {translate("Response.UnexpectedError")}
          </div>
        </DialogBody>
        <DialogFooter className="flex justify-center">
          <Button variant="Standard" onClick={closeCallback}>
            {translate("Action.Close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DeeplinkFailModal = (props: DeeplinkFailModalProps) => {
  const { TranslationBoundary } = getNotificationStreamHost();
  return (
    <TranslationBoundary>
      <DeeplinkFailModalContent {...props} />
    </TranslationBoundary>
  );
};

export default DeeplinkFailModal;
