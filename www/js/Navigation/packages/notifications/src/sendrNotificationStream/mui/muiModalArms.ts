import type { ComponentType, ReactNode } from "react";
import { getIsFoundationModalEnabled } from "../utils/getIsFoundationModalEnabled";

export type DeeplinkFailModalArmProps = {
  show: boolean;
  closeCallback: () => void;
  translate: (key: string) => string;
};

export type ReportNotificationDialogArmProps = {
  isOpen: boolean;
  onEscape: () => void;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  children: ReactNode;
};

export type ReportNotificationLayoutArmProps = {
  title: string;
  reportedNotification: ReactNode;
  body: ReactNode;
  apiError: ReactNode;
  actions: ReactNode;
  euDsa: ReactNode;
};

export type AbuseReportTextFieldArmProps = {
  id: string;
  value: unknown;
  onChange: (event: unknown) => void;
  onBlur: () => void;
  inputRef: React.Ref<unknown>;
  placeholder?: string;
  hasError: boolean;
  helperText?: string;
  disabled: boolean;
};

export type MuiModalArms = {
  DeeplinkFailModal: ComponentType<DeeplinkFailModalArmProps>;
  ReportNotificationDialog: ComponentType<ReportNotificationDialogArmProps>;
  ReportNotificationLayout: ComponentType<ReportNotificationLayoutArmProps>;
  AbuseReportInputItem: ComponentType<{ children?: ReactNode }>;
  AbuseReportTextField: ComponentType<AbuseReportTextFieldArmProps>;
  SubmitSpinner: ComponentType;
  StyleProvider: ComponentType<{ children?: ReactNode }>;
};

let arms: MuiModalArms | undefined;

export const registerMuiModalArms = (next: MuiModalArms): void => {
  arms = next;
};

export const getMuiModalArms = (): MuiModalArms | undefined => arms;

export const getFlaggedMuiModalArms = (): MuiModalArms | undefined =>
  getIsFoundationModalEnabled() ? undefined : arms;
