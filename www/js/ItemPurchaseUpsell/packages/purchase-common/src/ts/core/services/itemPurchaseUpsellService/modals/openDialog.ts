import React from 'react';
import ReactDOM from 'react-dom';
import { document } from '@rbx/core-lib/browser';
import PurchaseDialog from '../../../../react/components/PurchaseDialog';

/** The subset of the legacy `Roblox.Dialog.open` options the upsell modals use. */
export type OpenDialogOptions = {
  titleText?: string;
  bodyContent?: string;
  footerText?: string;
  imageUrl?: string;
  acceptText?: string;
  declineText?: string;
  showDecline?: boolean;
  xToCancel?: boolean;
  /** When false, Esc and backdrop clicks don't close the dialog. */
  dismissable?: boolean;
  allowHtmlContentInBody?: boolean;
  allowHtmlContentInFooter?: boolean;
  /** When true, a `false` return from `onAccept` keeps the dialog open. */
  fieldValidationRequired?: boolean;
  onAccept?: () => unknown;
  onDecline?: () => unknown;
  onCancel?: () => unknown;
};

let closeCurrent: (() => void) | undefined;

/** Closes the open dialog, if any, without firing its callbacks. */
export function closeDialog(): void {
  closeCurrent?.();
}

/**
 * Foundation replacement for `Roblox.Dialog.open`. Like the legacy dialog, only one is open at a
 * time: opening another replaces it without firing callbacks. When dismissable, Esc and backdrop
 * clicks count as cancel, like the X.
 */
export default function openDialog(options: OpenDialogOptions): void {
  closeDialog();
  if (!document) {
    return;
  }

  const container = document.createElement('div');
  document.body.appendChild(container);

  const close = () => {
    if (closeCurrent !== close) {
      return;
    }
    closeCurrent = undefined;
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  };
  closeCurrent = close;

  const onAccept = () => {
    if (options.fieldValidationRequired) {
      if (options.onAccept?.() !== false) {
        close();
      }
      return;
    }
    close();
    options.onAccept?.();
  };

  const onDecline = () => {
    close();
    options.onDecline?.();
  };

  const onCancel = () => {
    close();
    options.onCancel?.();
  };

  ReactDOM.render(
    React.createElement(PurchaseDialog, {
      titleText: options.titleText,
      bodyContent: options.bodyContent,
      footerText: options.footerText,
      imageUrl: options.imageUrl,
      acceptText: options.acceptText,
      declineText: options.declineText,
      showDecline: options.showDecline,
      hasCloseAffordance: options.xToCancel,
      dismissable: options.dismissable,
      allowHtmlContentInBody: options.allowHtmlContentInBody,
      allowHtmlContentInFooter: options.allowHtmlContentInFooter,
      onAccept,
      onDecline,
      onCancel
    }),
    container
  );
}
