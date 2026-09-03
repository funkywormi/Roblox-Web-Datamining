import React from "react";
import {
  Button as MuiButton,
  Dialog as MuiDialog,
  DialogActions as MuiDialogActions,
  DialogContent as MuiDialogContent,
  DialogContentText as MuiDialogContentText,
  DialogTitle as MuiDialogTitle,
} from "@mui/material";
import { WithTranslationsProps, withTranslations } from "react-utilities";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";
import translationConfig from "../translation.config";
import { getIsFoundationModalEnabled } from "../utils/getIsFoundationModalEnabled";

type DeeplinkFailModalProps = {
  show: boolean;
  closeCallback: () => void;
};

type InnerProps = DeeplinkFailModalProps & WithTranslationsProps;

// TODO(UBIQUITY-3143): remove once IsSendrNotificationStreamFoundationModalEnabled is fully rolled out.
const LegacyDeeplinkFailModal = ({ translate, show, closeCallback }: InnerProps): JSX.Element => (
  <MuiDialog
    maxWidth="md"
    onClose={closeCallback}
    open={show}
    PaperProps={{ className: "experience-join-failure-modal" }}
  >
    <MuiDialogTitle className="join-failure-modal-title border-bottom">
      {translate("Heading.JoinFailed")}
    </MuiDialogTitle>
    <MuiDialogContent className="join-failure-modal-content-root">
      <MuiDialogContentText className="join-failure-modal-body text">
        {translate("Response.UnexpectedError")}
      </MuiDialogContentText>
    </MuiDialogContent>
    <MuiDialogActions className="join-failure-modal-actions">
      <MuiButton className="join-failure-modal-button" onClick={closeCallback} variant="outlined">
        {translate("Action.Close")}
      </MuiButton>
    </MuiDialogActions>
  </MuiDialog>
);

const FoundationDeeplinkFailModal = ({
  translate,
  show,
  closeCallback,
}: InnerProps): JSX.Element => (
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

const DeeplinkFailModal = (props: InnerProps): JSX.Element =>
  getIsFoundationModalEnabled() ? (
    <FoundationDeeplinkFailModal {...props} />
  ) : (
    <LegacyDeeplinkFailModal {...props} />
  );

export default withTranslations(DeeplinkFailModal, translationConfig);
