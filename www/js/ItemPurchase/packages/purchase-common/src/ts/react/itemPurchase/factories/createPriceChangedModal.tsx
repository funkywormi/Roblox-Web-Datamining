import React, { useState } from 'react';
import { renderToString } from 'react-dom/server';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import PriceLabel from '../components/PriceLabel';
import BalanceAfterSaleText from '../components/BalanceAfterSaleText';
import FoundationPurchaseModal from '../components/FoundationPurchaseModal';
import { SelfProvidedTranslate } from '../SelfProvidedTranslate';
import { purchasingNamespaces, usePurchasingTranslate, type PurchaseTranslate } from '../useTranslate';
import type { ModalService } from '../types/modal';

const { resources } = itemPurchaseConstants;

interface PriceChangedModalProps {
  translate?: PurchaseTranslate;
  expectedPrice: number;
  currentPrice: number;
  onAction: () => void;
  loading?: boolean;
}

export default function createPriceChangedModal(): [React.ComponentType<PriceChangedModalProps>, ModalService] {
  let setOpenFn: ((open: boolean) => void) | null = null;

  function PriceChangedModalInner({ translate, expectedPrice, currentPrice, onAction, loading = false }: PriceChangedModalProps & { translate: PurchaseTranslate }) {
    const [open, setOpen] = React.useState(false);
    const [checked, setChecked] = useState(false);

    React.useEffect(() => {
      setOpenFn = setOpen;
      return () => { if (setOpenFn === setOpen) setOpenFn = null; };
    }, []);

    const body = (
      <React.Fragment>
        <div
          className='modal-message'
          dangerouslySetInnerHTML={{
            __html: translate(resources.priceChangedMessage, {
              robuxBefore: renderToString(
                <PriceLabel {...{ price: expectedPrice, color: 'gray' }} />
              ),
              robuxAfter: renderToString(<PriceLabel {...{ price: currentPrice, color: 'gray' }} />)
            })
          }}
        />
        <div className='modal-checkbox checkbox'>
          <input
            id='modal-checkbox-input'
            name='agreementCheckBox'
            type='checkbox'
            checked={checked}
          />
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions,jsx-a11y/click-events-have-key-events */}
          <label onClick={() => setChecked(!checked)} htmlFor='modal-checkbox-input'>
            {translate(resources.agreeAndPayLabel)}
          </label>
        </div>
      </React.Fragment>
    );

    return (
      <FoundationPurchaseModal
        open={open}
        title={translate(resources.priceChangedHeading)}
        body={body}
        neutralButtonText={translate(resources.cancelAction)}
        actionButtonText={translate(resources.buyRobuxAction)}
        onAction={onAction}
        onNeutral={() => setOpen(false)}
        loading={loading}
        disableActionButton={!checked}
        footerText={<BalanceAfterSaleText expectedPrice={currentPrice} />}
        actionButtonShow
      />
    );
  }


  function PriceChangedModal({ translate, ...props }: PriceChangedModalProps) {
    return (
      <SelfProvidedTranslate
        translate={translate}
        namespaces={purchasingNamespaces}
        useTranslate={usePurchasingTranslate}
        render={t => <PriceChangedModalInner {...props} translate={t} />}
      />
    );
  }

  const modalService = {
    open: () => { setOpenFn?.(true); },
    close: () => { setOpenFn?.(false); }
  };

  return [PriceChangedModal, modalService];
}
