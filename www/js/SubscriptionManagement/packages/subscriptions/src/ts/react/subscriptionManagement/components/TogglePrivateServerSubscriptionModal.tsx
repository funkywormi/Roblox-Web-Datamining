import React from 'react';
import { useTranslation } from 'react-utilities';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@rbx/ui';
import '../../../../css/subscriptionManagement/privateServerDetails.scss';
import { escapeHtml } from 'core-utilities';
import { MyPrivateServerType } from '../../../core/types/privateServerTypes';

type TogglePrivateServerSubscriptionProps = {
  privateServer: MyPrivateServerType;
  willRenew: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
  submitting: boolean;
};

const TogglePrivateServerSubscription: React.FC<TogglePrivateServerSubscriptionProps> = ({
  privateServer,
  willRenew,
  open,
  setOpen,
  onConfirm,
  submitting
}) => {
  const { translate } = useTranslation();

  const accessDateString = new Date(privateServer.expirationDate).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const safePrivateServerName = escapeHtml()(privateServer.name);
  const safePrivateServerProviderName = escapeHtml()(privateServer.universeName);

  let titleText;
  let bodyText;
  let confirmButtonText;
  if (willRenew) {
    // show the cancellation modal
    titleText = translate('Heading.Unsubscribe');
    bodyText = translate('Text.UnsubscribePrivateServer', {
      privateServerName: safePrivateServerName,
      privateServerProviderName: safePrivateServerProviderName,
      expiryDate: accessDateString
    });
    confirmButtonText = translate('Heading.Unsubscribe');
  } else {
    // show the resubscribe modal
    titleText = translate('Heading.RenewSubscription');
    bodyText = (
      <div
        dangerouslySetInnerHTML={{
          __html: translate('Text.RenewPrivateServerSubscription.V2', {
            privateServerName: safePrivateServerName,
            privateServerProviderName: safePrivateServerProviderName,
            robuxIcon: "<span class='icon-robux-16x16'></span>",
            priceInRobux: privateServer.priceInRobux ?? 0
          })
        }}
      />
    );
    confirmButtonText = translate('Button.Renew');
  }

  return (
    <Dialog
      className='private-server-subscription-modal'
      maxWidth='Medium'
      open={open}
      onClose={() => setOpen(false)}
      TransitionProps={{ timeout: 0 }}>
      <DialogTitle className='private-server-subscription-modal-title'>{titleText}</DialogTitle>
      <DialogContent className='private-server-subscription-modal-content' dividers>
        <DialogContentText>{bodyText}</DialogContentText>
      </DialogContent>
      <DialogActions className='private-server-subscription-modal-footer'>
        <Button
          className='action-button'
          variant='contained'
          color='secondary'
          onClick={() => setOpen(false)}>
          {translate('Action.Dialog.Cancel')}
        </Button>
        <Button
          className='action-button'
          variant='contained'
          onClick={onConfirm}
          disabled={submitting}>
          {confirmButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TogglePrivateServerSubscription;
