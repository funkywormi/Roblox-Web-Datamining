/* eslint no-void: ["error", { "allowAsStatement": true }] */
import React, { useState } from 'react';
import { TranslateFunction } from 'react-utilities';
import { createModal, IModalService } from 'react-style-guide';
import { TRANSLATION_KEYS } from '../constants/translationConstants';

type RemoveSavedItemModalProps = {
  translate: TranslateFunction;
  header: string;
  cancelText: string;
  onDelete: () => void;
  onNeutral?: () => void;
};

export function createRemoveSavedItemModal(): [
  ({
    header,
    cancelText,
    translate,
    onDelete,
    onNeutral
  }: RemoveSavedItemModalProps) => JSX.Element,
  IModalService
] {
  const [Modal, modalService] = createModal();

  function RemoveSavedItemModal({
    header,
    cancelText,
    translate,
    onDelete,
    onNeutral
  }: RemoveSavedItemModalProps) {
    const [loading, setLoading] = useState<boolean>(false);

    // TODO: Figure out how to prevent closing modal when clicking on backdrop
    return (
      <Modal
        id='add-card-modal'
        title={header}
        body={cancelText}
        loading={loading}
        neutralButtonText={translate(TRANSLATION_KEYS.CancelAction)}
        actionButtonText={translate(TRANSLATION_KEYS.DeleteAction)}
        onNeutral={() => {
          void onNeutral?.();
          modalService.close();
        }}
        onAction={() => {
          setLoading(true);
          void onDelete();
          setLoading(false);
          modalService.close();
        }}
        closeable
        size='md'
        actionButtonShow
      />
    );
  }

  return [RemoveSavedItemModal, modalService];
}

export default createRemoveSavedItemModal;
