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

type MigrationCompleteModalProps = {
  isOpen: boolean;
  onAcknowledge: () => void;
};

const MigrationCompleteModal: FC<MigrationCompleteModalProps> = ({ isOpen, onAcknowledge }) => {
  const { translateWithNamespace } = useTranslation();
  const translate = (key: string) =>
    translateWithNamespace(TranslationNamespace.GroupManagement, key);

  return (
    <Dialog size='Large' isModal hasCloseAffordance={false} open={isOpen}>
      <DialogContent>
        <DialogBody className='flex flex-col gap-large'>
          <DialogTitle className='margin-none'>{translate('Heading.RolesUnified')}</DialogTitle>
          <p className='text-body-medium content-default margin-none'>
            {translate('Description.RolesUnified')}
          </p>
        </DialogBody>
        <DialogFooter>
          <div className='flex flex-row gap-small'>
            <Button variant='Emphasis' size='Medium' onClick={onAcknowledge}>
              {translate('Action.Ok')}
            </Button>
            <Button
              variant='Standard'
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

export { MigrationCompleteModal };
