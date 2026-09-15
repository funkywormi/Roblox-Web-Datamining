import React, { ReactNode } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
  Divider,
  IconButton,
  ProgressCircle
} from '@rbx/foundation-ui';

// Controlled FUI replacement for the core-ui createModal + RobloxSimpleModal shell.
// The X, backdrop, escape and the Cancel button all resolve to onNeutral.
export type FoundationPurchaseModalProps = {
  open: boolean;
  title: string;
  body?: ReactNode;
  footerText?: ReactNode;
  actionButtonShow?: boolean;
  actionButtonText?: string;
  neutralButtonText?: string;
  onAction?: () => void;
  onNeutral?: () => void;
  loading?: boolean;
  disableActionButton?: boolean;
  closeLabel?: string;
};

const FoundationPurchaseModal = ({
  open,
  title,
  body = null,
  footerText = null,
  actionButtonShow = false,
  actionButtonText = '',
  neutralButtonText = '',
  onAction,
  onNeutral,
  loading = false,
  disableActionButton = false,
  closeLabel = 'Close'
}: FoundationPurchaseModalProps) => (
  <Dialog
    open={open}
    onOpenChange={nextOpen => {
      if (!nextOpen) {
        onNeutral?.();
      }
    }}
    isModal
    size="Medium"
    type="Default"
    hasCloseAffordance={false}
    hasMarginTop={false}
    closeLabel={closeLabel}>
    <DialogContent className="relative width-full">
      <IconButton
        icon="icon-regular-x"
        ariaLabel={closeLabel}
        variant="OverMedia"
        size="Large"
        isCircular
        onClick={onNeutral}
        style={{ position: 'absolute', top: 'var(--size-300)', right: 'var(--size-300)', zIndex: 1 }}
      />
      <DialogTitle className="padding-x-xlarge padding-top-xlarge padding-bottom-medium">
        {title}
      </DialogTitle>
      <Divider />
      <DialogBody className="padding-top-medium">{body}</DialogBody>
      <DialogFooter className="gap-small flex flex-col">
        {loading ? (
          <ProgressCircle variant="Indeterminate" ariaLabel="Loading" />
        ) : (
          <div className="gap-small flex flex-row justify-center">
            {actionButtonShow && (
              <Button
                variant="Emphasis"
                onClick={onAction}
                isDisabled={disableActionButton}
                style={{ minWidth: '7rem' }}>
                {actionButtonText}
              </Button>
            )}
            {neutralButtonText && (
              <Button variant="Standard" onClick={onNeutral} style={{ minWidth: '7rem' }}>
                {neutralButtonText}
              </Button>
            )}
          </div>
        )}
        {footerText && <div className="text-footer">{footerText}</div>}
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default FoundationPurchaseModal;
