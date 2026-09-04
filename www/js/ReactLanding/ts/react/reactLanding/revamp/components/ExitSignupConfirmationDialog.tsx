import React from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle
} from '@rbx/foundation-ui';
import { useTranslation } from 'react-utilities';
import { exitSignupConfirmationStrings } from '../../constants/signupConstants';

type ExitSignupConfirmationDialogProps = {
  open: boolean;
  onConfirmExit: () => void;
  onCancel: () => void;
};

const ExitSignupConfirmationDialog = ({
  open,
  onConfirmExit,
  onCancel
}: ExitSignupConfirmationDialogProps): JSX.Element => {
  const { translate } = useTranslation();
  const title = translate(exitSignupConfirmationStrings.Title);
  const body = translate(exitSignupConfirmationStrings.Body);
  const confirmText = translate(exitSignupConfirmationStrings.Confirm);
  const cancelText = translate(exitSignupConfirmationStrings.Cancel);

  return (
    <Dialog open={open} isModal size='Small' type='Default' hasCloseAffordance={false}>
      <DialogContent>
        <DialogBody className='flex flex-col gap-xsmall'>
          <DialogTitle className='text-heading-small content-emphasis'>{title}</DialogTitle>
          <p className='text-body-medium content-default'>{body}</p>
        </DialogBody>
        <DialogFooter className='flex flex-col gap-small padding-top-medium'>
          <Button variant='Emphasis' size='Medium' onClick={onConfirmExit}>
            {confirmText}
          </Button>
          <Button variant='Standard' size='Medium' onClick={onCancel}>
            {cancelText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExitSignupConfirmationDialog;
