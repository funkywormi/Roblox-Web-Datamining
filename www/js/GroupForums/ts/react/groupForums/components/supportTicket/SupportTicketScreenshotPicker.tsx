import React, { useCallback, useRef } from 'react';
import { Button, Icon } from '@rbx/foundation-ui';

type SupportTicketScreenshotPickerProps = {
  accept: string;
  addLabel: string;
  isTile: boolean;
  onAddFiles: (files: FileList | File[]) => void;
};

const SupportTicketScreenshotPicker = ({
  accept,
  addLabel,
  isTile,
  onAddFiles
}: SupportTicketScreenshotPickerProps): JSX.Element => {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleSelected = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { target } = event;
      if (target.files && target.files.length > 0) {
        onAddFiles(target.files);
      }
      // Allow re-selecting the same file.
      target.value = '';
    },
    [onAddFiles]
  );

  return (
    <React.Fragment>
      <Button
        className={
          isTile
            ? 'support-ticket-add-screenshots-button support-ticket-screenshot-tile'
            : 'support-ticket-add-screenshots-button support-ticket-add-screenshots-button-compact'
        }
        data-testid='support-ticket-add-screenshots-button'
        variant='Standard'
        size='Medium'
        onClick={openPicker}>
        {isTile ? (
          <span className='support-ticket-screenshot-add-inner'>
            <Icon name='icon-regular-plus-large' size='Medium' />
            <span className='text-body-small'>{addLabel}</span>
          </span>
        ) : (
          addLabel
        )}
      </Button>
      <input
        ref={inputRef}
        type='file'
        accept={accept}
        multiple
        className='hidden'
        data-testid='support-ticket-screenshots-input'
        onChange={handleSelected}
      />
    </React.Fragment>
  );
};

export default SupportTicketScreenshotPicker;
