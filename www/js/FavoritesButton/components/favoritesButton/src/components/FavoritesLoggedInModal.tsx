import React, { Fragment } from 'react';
import { TranslateFunction } from '@rbx/core-scripts/legacy/react-utilities';
import { SimpleModal } from '@rbx/core-ui/legacy/react-style-guide';
import LoginUrlService from '../services/LoginUrlService';

export function FavoritesLoggedInModal({
  showModal,
  onModalClose,
  translate
}: {
  showModal: boolean;
  onModalClose: () => void;
  translate: TranslateFunction;
}): JSX.Element {
  const onLoginPressed = () => {
    window.location.href = LoginUrlService.getLoginUrl();
  };

  const modalBody = <p className='NotLoggedInModalBody'>{translate('DescriptionLoginRequired')}</p>;

  return (
    <SimpleModal
      show={showModal}
      title={translate('LabelLoginRequired')}
      body={modalBody}
      actionButtonShow
      actionButtonText={translate('ActionLogin')}
      neutralButtonText={translate('ActionCancel')}
      onAction={onLoginPressed}
      onClose={onModalClose}
      onNeutral={onModalClose}
    />
  );
}

export default FavoritesLoggedInModal;
