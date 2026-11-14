import React, { useCallback, useState } from "react";
import {
  Button as MuiButton,
  CircularProgress,
  Dialog as MuiDialog,
  DialogActions as MuiDialogActions,
  DialogContent as MuiDialogContent,
  DialogContentText as MuiDialogContentText,
  DialogTitle as MuiDialogTitle,
  Grid,
  StyledEngineProvider,
} from "@mui/material";
import { DeviceMeta } from "Roblox";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "../../styledMuiComponents";
import type {
  AbuseReportTextFieldArmProps,
  DeeplinkFailModalArmProps,
  MuiModalArms,
  ReportNotificationDialogArmProps,
  ReportNotificationLayoutArmProps,
} from "./muiModalArms";

// TODO(UBIQUITY-3143): remove once IsSendrNotificationStreamFoundationModalEnabled is fully rolled out.
const DeeplinkFailModal = ({ translate, show, closeCallback }: DeeplinkFailModalArmProps) => (
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

const ReportNotificationDialog = ({
  isOpen,
  onEscape,
  onClick,
  children,
}: ReportNotificationDialogArmProps) => {
  const [isOnPhone] = useState(() => {
    if (DeviceMeta) {
      const { isPhone } = DeviceMeta();
      return isPhone;
    }
    return false;
  });

  const onClose = useCallback(
    (_event: unknown, reason: "backdropClick" | "escapeKeyDown") => {
      if (reason === "escapeKeyDown") {
        onEscape();
      }
    },
    [onEscape],
  );

  return (
    <Dialog
      maxWidth="md"
      onClose={onClose}
      open={isOpen}
      isPhone={isOnPhone}
      onClick={onClick}
      className="report-notification-modal"
    >
      {children}
    </Dialog>
  );
};

const ReportNotificationLayout = ({
  title,
  reportedNotification,
  body,
  apiError,
  actions,
  euDsa,
}: ReportNotificationLayoutArmProps) => (
  <React.Fragment>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <Grid item xs={12} classes={{ root: "reported-notification" }}>
        {reportedNotification}
      </Grid>
      {body}
    </DialogContent>
    {apiError ? (
      <Grid item xs={12} classes={{ root: "text-error notification-api-error" }}>
        {apiError}
      </Grid>
    ) : null}
    <DialogActions>{actions}</DialogActions>
    {euDsa ? (
      <Grid item xs={12} classes={{ root: "report-eu-dsa-text" }}>
        {euDsa}
      </Grid>
    ) : null}
  </React.Fragment>
);

const AbuseReportInputItem = ({ children }: { children?: React.ReactNode }) => (
  <Grid item xs={12}>
    {children}
  </Grid>
);

const AbuseReportTextField = ({
  id,
  value,
  onChange,
  onBlur,
  inputRef,
  placeholder,
  hasError,
  helperText,
  disabled,
}: AbuseReportTextFieldArmProps) => (
  <TextField
    value={value}
    onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>}
    onBlur={onBlur as React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>}
    id={id}
    inputRef={inputRef}
    placeholder={placeholder}
    error={hasError}
    multiline
    minRows={6}
    fullWidth
    required
    helperText={helperText}
    disabled={disabled}
  />
);

const SubmitSpinner = () => <CircularProgress size={16} />;

const StyleProvider = ({ children }: { children?: React.ReactNode }) => (
  <StyledEngineProvider injectFirst>{children}</StyledEngineProvider>
);

export const dotnetMuiModalArms: MuiModalArms = {
  DeeplinkFailModal,
  ReportNotificationDialog,
  ReportNotificationLayout,
  AbuseReportInputItem,
  AbuseReportTextField,
  SubmitSpinner,
  StyleProvider,
};
