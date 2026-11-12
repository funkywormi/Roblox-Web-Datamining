import React from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle
} from '@rbx/foundation-ui';
import { SelfProvidedTranslate } from '../itemPurchase/SelfProvidedTranslate';
import {
  purchasingNamespaces,
  usePurchasingTranslate,
  type PurchaseTranslate
} from '../itemPurchase/useTranslate';

export type PurchaseDialogProps = {
  titleText?: string;
  bodyContent?: string;
  footerText?: string;
  imageUrl?: string;
  acceptText?: string;
  declineText?: string;
  showDecline?: boolean;
  hasCloseAffordance?: boolean;
  dismissable?: boolean;
  allowHtmlContentInBody?: boolean;
  allowHtmlContentInFooter?: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onCancel: () => void;
  translate?: PurchaseTranslate;
};

const renderContent = (content: string, allowHtml?: boolean) =>
  allowHtml ? (
    // Callers build these strings with escapeHtml, as they did for the legacy dialog.
    // eslint-disable-next-line react/no-danger
    <div dangerouslySetInnerHTML={{ __html: content }} />
  ) : (
    <div>{content}</div>
  );

const PurchaseDialogInner = ({
  titleText,
  bodyContent,
  footerText,
  imageUrl,
  acceptText,
  declineText,
  showDecline = true,
  hasCloseAffordance = false,
  dismissable = true,
  allowHtmlContentInBody,
  allowHtmlContentInFooter,
  onAccept,
  onDecline,
  onCancel,
  translate
}: PurchaseDialogProps & { translate: PurchaseTranslate }): React.JSX.Element => {
  const preventDismiss = (event: Event) => {
    if (!dismissable) {
      event.preventDefault();
    }
  };
  // DialogContent forwards these to Radix but doesn't declare them.
  const dismissHandlers = { onEscapeKeyDown: preventDismiss, onPointerDownOutside: preventDismiss };

  return (
  <Dialog
    open
    onOpenChange={(nextOpen: boolean) => {
      if (!nextOpen) {
        onCancel();
      }
    }}
    isModal
    size='Medium'
    hasCloseAffordance={hasCloseAffordance}
    closeLabel={translate('Action.Close') || 'Close'}>
    <DialogContent className='relative width-full' {...dismissHandlers}>
      <DialogBody className='purchase-dialog-body gap-large flex flex-col'>
        <DialogTitle
          className={
            hasCloseAffordance
              ? 'purchase-dialog-title-with-close text-heading-medium'
              : 'text-heading-medium'
          }>
          {titleText}
        </DialogTitle>
        {imageUrl && (
          <div className='flex justify-center'>
            <img className='modal-thumb' src={imageUrl} alt='' />
          </div>
        )}
        {bodyContent && renderContent(bodyContent, allowHtmlContentInBody)}
      </DialogBody>
      <DialogFooter className='gap-small flex flex-col'>
        <div className='gap-small flex flex-row-reverse'>
          <Button variant='Emphasis' className='fill basis-0' onClick={onAccept}>
            {acceptText}
          </Button>
          {showDecline && declineText && (
            <Button variant='Standard' className='fill basis-0' onClick={onDecline}>
              {declineText}
            </Button>
          )}
        </div>
        {footerText?.trim() && (
          <div className='text-footer text-center'>
            {renderContent(footerText, allowHtmlContentInFooter)}
          </div>
        )}
      </DialogFooter>
    </DialogContent>
  </Dialog>
  );
};

// Dual-path translation boundary (detached-root render — self-wraps on .NET). See UnifiedRobuxUpsellModal.
const PurchaseDialog = ({ translate, ...props }: PurchaseDialogProps): React.JSX.Element => (
  <SelfProvidedTranslate
    translate={translate}
    namespaces={purchasingNamespaces}
    useTranslate={usePurchasingTranslate}
    render={t => <PurchaseDialogInner {...props} translate={t} />}
  />
);

export default PurchaseDialog;
