/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/jsx-no-literals */
/* eslint no-void: ["error", { "allowAsStatement": true }] */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TranslateFunction } from 'react-utilities';
import { Button, IModalService, Modal, TSystemFeedbackService } from 'react-style-guide';
import { paymentFlowAnalyticsService } from 'core-roblox-utilities';
import { TRANSLATION_KEYS } from '../constants/translationConstants';
import { Address } from '../../billingAddressForm/constants/TypeDefinitions';
import BillingInfoForm from '../../billingAddressForm/App';

type TUpdateBillingAddressModalProps = {
  translate: TranslateFunction;
  systemFeedbackService: TSystemFeedbackService;
  onUpdateSuccess: (updatedAddress: Address) => void;
  address: Address;
};

const createUpdateBillingAddressModal = (): [
  ({
    translate,
    systemFeedbackService,
    onUpdateSuccess,
    address
  }: TUpdateBillingAddressModalProps) => JSX.Element,
  IModalService
] => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const modalService: IModalService = useMemo(
    () => ({
      open: () => setModalOpen(true),
      close: () => setModalOpen(false)
    }),
    []
  );

  const UpdatePaymentMethodModal = ({
    translate,
    systemFeedbackService,
    onUpdateSuccess,
    address
  }: TUpdateBillingAddressModalProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [canSubmit, setCanSubmit] = useState<boolean>(false);
    const [processAddressSave, setProcessAddressSave] = useState(false);
    const [updatedAddress, setUpdatedAddress] = useState<Address>();

    const onUpdateAddress = useCallback(
      (newAddress: Address) => {
        switch (newAddress.country) {
          case 'US':
            if (
              newAddress.city &&
              newAddress.state &&
              newAddress.postalCode &&
              (newAddress.country !== address.country ||
                newAddress.state !== address.state ||
                newAddress.city !== address.city ||
                newAddress.postalCode !== address.postalCode)
            ) {
              setCanSubmit(true);
              setUpdatedAddress(newAddress);
            }
            break;
          case 'CA':
            if (
              newAddress.city &&
              newAddress.state &&
              (newAddress.country !== address.country ||
                newAddress.state !== address.state ||
                newAddress.city !== address.city)
            ) {
              setCanSubmit(true);
              setUpdatedAddress(newAddress);
            }
            break;
          default:
        }
      },
      [address.city, address.country, address.postalCode, address.state]
    );

    const handleSaveClicked = useCallback(() => {
      setLoading(true);
      setProcessAddressSave(true);
    }, []);

    const onEditableFormUpdateSuccess = useCallback(() => {
      if (updatedAddress) {
        void onUpdateSuccess(updatedAddress);
        systemFeedbackService.success(translate(TRANSLATION_KEYS.UpdateBillingAddressSuccessDesc));
        setLoading(false);
        modalService.close();
      }
    }, [onUpdateSuccess, systemFeedbackService, translate, updatedAddress]);

    return (
      <Modal
        show={modalOpen}
        onHide={modalService.close}
        size='md'
        id='update-payment-method-modal'>
        <Modal.Header
          title={translate(TRANSLATION_KEYS.UpdateBillingAddressHeading)}
          onClose={modalService.close}
        />
        <Modal.Body>
          <BillingInfoForm
            prefilledAddress={address}
            onUpdateAddress={onUpdateAddress}
            processAddressSave={processAddressSave}
            onUpdateSuccess={onEditableFormUpdateSuccess}
            hideSaveSection
            triggeringContext={
              paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_PAYMENT_METHODS_SETTING
            }
          />
        </Modal.Body>
        <div className='footer-divider' />
        <Modal.Footer>
          <div className='modal-buttons'>
            <Button
              variant={Button.variants.secondary}
              width={Button.widths.full}
              size={Button.sizes.large}
              className='action-button'
              onClick={modalService.close}>
              {translate(TRANSLATION_KEYS.CancelAction)}
            </Button>
            <Button
              width={Button.widths.full}
              size={Button.sizes.large}
              className='action-button'
              isLoading={loading}
              isDisabled={!canSubmit}
              onClick={handleSaveClicked}>
              {translate(TRANSLATION_KEYS.SaveAction)}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    );
  };

  return [UpdatePaymentMethodModal, modalService];
};

export default createUpdateBillingAddressModal;
