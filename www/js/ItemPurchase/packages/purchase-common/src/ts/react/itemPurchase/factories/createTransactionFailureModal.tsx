import React from 'react';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import FoundationPurchaseModal from '../components/FoundationPurchaseModal';
import { SelfProvidedTranslate } from '../SelfProvidedTranslate';
import { purchasingNamespaces, usePurchasingTranslate, type PurchaseTranslate } from '../useTranslate';
import type { ModalService } from '../types/modal';

const { resources } = itemPurchaseConstants;

interface TransactionFailureModalProps {
  translate?: PurchaseTranslate;
  title: string;
  message: string;
  onDecline?: (() => void) | null;
}

export default function createTransactionFailureModal(): [React.ComponentType<TransactionFailureModalProps>, ModalService] {
  let setOpenFn: ((open: boolean) => void) | null = null;

  function TransactionFailureModalInner({ translate, title, message, onDecline = null }: TransactionFailureModalProps & { translate: PurchaseTranslate }) {
    const [open, setOpen] = React.useState(false);
    React.useEffect(() => {
      setOpenFn = setOpen;
      return () => { if (setOpenFn === setOpen) setOpenFn = null; };
    }, []);

    const body = <div className='modal-message'>{message}</div>;
    return (
      <FoundationPurchaseModal
        open={open}
        title={title}
        body={body}
        thumbnail={<span className='icon-warning-orange-150x150' />}
        neutralButtonText={translate(resources.okAction)}
        onNeutral={() => {
          setOpen(false);
          onDecline?.();
        }}
        actionButtonShow={false}
      />
    );
  }

  const modalService = {
    open: () => { setOpenFn?.(true); },
    close: () => { setOpenFn?.(false); }
  };

  function TransactionFailureModal({ translate, ...props }: TransactionFailureModalProps) {
    return (
      <SelfProvidedTranslate
        translate={translate}
        namespaces={purchasingNamespaces}
        useTranslate={usePurchasingTranslate}
        render={t => <TransactionFailureModalInner {...props} translate={t} />}
      />
    );
  }

  return [TransactionFailureModal, modalService];
}
