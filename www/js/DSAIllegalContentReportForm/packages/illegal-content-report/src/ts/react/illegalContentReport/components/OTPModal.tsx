import React, { ReactElement } from 'react';
import { Dialog, DialogContent, DialogBody, DialogTitle } from '@rbx/foundation-ui';

type Props = {
  /* A boolean indicating whether the modal is open or not */
  open: boolean;

  /* A function to be called when user presses the escape key or clicks on a close button */
  onClose: () => void;

  /* A optional string that represents title of modal. If not provided, a default title will be used */
  title?: string;

  /* The optional content of the modal. It can be a simple string or a React Node */
  content?: string | React.ReactNode;

  /* Children elements to be rendered inside the modal, such as buttons or custom footers */
  children?: ReactElement;
};

const OTPModal = ({ open, onClose, title, content, children }: Props): ReactElement => {
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      isModal
      size='Medium'
      type='Default'
      hasCloseAffordance
      closeLabel='Close'>
      <DialogContent>
        <DialogBody className='gap-large flex flex-col'>
          <DialogTitle className='text-heading-medium'>{title}</DialogTitle>
          {content && <p>{content}</p>}
          {children}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

OTPModal.defaultProps = {
  title: 'Default Modal Title',
  content: '',
  children: null
};

export default OTPModal;

