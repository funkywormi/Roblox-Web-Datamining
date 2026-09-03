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
import { DEVFORUM_URL, type BreakingChangeEntry } from '../utils/unificationUtils';
import { BreakingChangesTable } from './BreakingChangesTable';

type BreakingChangesModalProps = {
  isOpen: boolean;
  breakingChanges: BreakingChangeEntry[];
  groupId: number;
  getCreatorHubRoleUrl?: (roleId: string) => string;
  getLegacyRolesUrl?: (groupId: string) => string;
  onContinue: () => void;
  onAskLater: () => void;
};

const BreakingChangesModal: FC<BreakingChangesModalProps> = ({
  isOpen,
  breakingChanges,
  groupId,
  getCreatorHubRoleUrl,
  getLegacyRolesUrl,
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
          <DialogTitle className='margin-none'>{translate('Heading.BreakingChanges')}</DialogTitle>
          <div className='flex flex-col gap-large margin-none'>
            <p className='text-body-medium content-default margin-none'>
              {translate('Description.BreakingChanges')}
            </p>
            <p className='text-body-medium content-default margin-none'>
              {translate('Description.RemovePermissions')}
            </p>
            <BreakingChangesTable
              breakingChanges={breakingChanges}
              groupId={groupId}
              getCreatorHubRoleUrl={getCreatorHubRoleUrl}
              getLegacyRolesUrl={getLegacyRolesUrl}
            />
          </div>
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

export { BreakingChangesModal };
