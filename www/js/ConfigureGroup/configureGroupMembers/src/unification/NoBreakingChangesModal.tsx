import type { FC } from 'react';
import React from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from '@rbx/foundation-ui';
import { useTranslation } from '@rbx/intl';
import TranslationNamespace from '../constants/TranslationNamespace';
import { DEVFORUM_URL } from '../utils/unificationUtils';

type NoBreakingChangesModalProps = {
  isOpen: boolean;
  onContinue: () => void;
  onAskLater: () => void;
};

const NoBreakingChangesModal: FC<NoBreakingChangesModalProps> = ({
  isOpen,
  onContinue,
  onAskLater,
}) => {
  const { translateWithNamespace } = useTranslation();
  const translate = (key: string) =>
    translateWithNamespace(TranslationNamespace.GroupManagement, key);

  return (
    <Dialog size='Large' isModal hasCloseAffordance={false} open={isOpen}>
      <DialogContent>
        <DialogBody className='flex flex-col gap-large'>
          <DialogTitle className='margin-none'>
            {translate('Heading.NoBreakingChanges')}
          </DialogTitle>
          <p className='text-body-medium content-default margin-none'>
            {translate('Label.NoBreakingChanges')}
          </p>
        </DialogBody>
        <DialogFooter>
          <div className='flex flex-row gap-small'>
            <Button variant='Emphasis' size='Medium' onClick={onContinue}>
              {translate('Action.Continue')}
            </Button>
            <Button variant='Standard' size='Medium' onClick={onAskLater}>
              {translate('Action.AskLater')}
            </Button>
            <Button
              variant='Link'
              size='Medium'
              as='a'
              href={DEVFORUM_URL}
              target='_blank'
              rel='noopener noreferrer'>
              {translate('Action.LearnMore')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { NoBreakingChangesModal };
