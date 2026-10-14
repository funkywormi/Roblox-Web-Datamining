import type { FC } from 'react';
import React from 'react';
import { useTranslation, withTranslation } from '@rbx/intl';
import TranslationNamespace from '../constants/TranslationNamespace';
import type { UseUnificationOptInOptions } from '../hooks/useUnificationOptIn';
import { useUnificationOptIn } from '../hooks/useUnificationOptIn';
import { ModalState } from '../utils/unificationUtils';
import { MigrationCompleteModal } from './UnificationCompleteModal';

export type UnificationOptInModalProps = UseUnificationOptInOptions;

const UnificationOptInModalInner: FC<UnificationOptInModalProps> = (unificationOptions) => {
  const { ready } = useTranslation();
  const { modalState, onAcknowledge } = useUnificationOptIn(unificationOptions);

  if (!ready || modalState !== ModalState.Migrated) {
    return null;
  }

  return <MigrationCompleteModal isOpen onAcknowledge={onAcknowledge} />;
};

const UnificationOptInModal = withTranslation(UnificationOptInModalInner, [
  TranslationNamespace.GroupManagement,
]);

export { UnificationOptInModal };
