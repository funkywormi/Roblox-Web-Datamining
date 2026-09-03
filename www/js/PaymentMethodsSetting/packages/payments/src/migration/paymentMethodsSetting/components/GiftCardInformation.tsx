/* eslint no-void: ["error", { "allowAsStatement": true }] */
import React, { useCallback, useEffect, useState } from 'react';
import { TranslateFunction } from 'react-utilities';
import { TSystemFeedbackService } from 'react-style-guide';
import { Address } from '../../billingAddressForm/constants/TypeDefinitions';
import {
  deleteUserSettingsAddress,
  getUserSettingsAddress
} from '../services/paymentMethodsSettingService';
import { TRANSLATION_KEYS } from '../constants/translationConstants';
import createRemoveSavedItemModal from '../services/createRemoveSavedItemModal';
import createUpdateBillingAddressModal from '../services/createUpdateBillingAddressModal';

type GiftCardInformationProps = {
  translate: TranslateFunction;
  systemFeedbackService: TSystemFeedbackService;
};

const GiftCardInformation: React.FC<GiftCardInformationProps> = ({
  systemFeedbackService,
  translate
}) => {
  const [savedAddress, setSavedAddress] = useState<Address>();
  const savedGiftCardInformationHeader = translate(TRANSLATION_KEYS.SavedGiftCardInformationHeader);
  const deleteBillingAddressHeader = translate(TRANSLATION_KEYS.DeleteBillingAddressHeading);
  const cancelText = translate(TRANSLATION_KEYS.AreYouSureDeleteBillingAddressDesc);
  const [RemoveSavedItemModal, removeSavedItemModalService] = createRemoveSavedItemModal();
  const [
    UpdateBillingAddressModal,
    UpdateBillingAddressModalService
  ] = createUpdateBillingAddressModal();

  useEffect(() => {
    const getUserSettingAddressAndSet = async () => {
      try {
        const {
          data: {
            address: { country, state, city, postalCode }
          }
        } = await getUserSettingsAddress();
        setSavedAddress({ country, state, city, postalCode });
      } catch (error: unknown) {
        // no-op since we are just trying to display when there is address saved.
      }
    };

    // eslint-disable-next-line no-void
    void getUserSettingAddressAndSet();
  }, []);

  const removeSavedItemModalOnDelete = async () => {
    try {
      const response = await deleteUserSettingsAddress();
      systemFeedbackService.success(translate(TRANSLATION_KEYS.DeleteBillingAddressSuccessDesc));
      setSavedAddress(undefined);
    } catch (e) {
      systemFeedbackService.warning(translate(TRANSLATION_KEYS.GenericSomethingWentWrongResponse));
    }
  };

  if (!savedAddress) {
    return null;
  }

  const formattedAddress = savedAddress.postalCode
    ? `${savedAddress.city}, ${savedAddress.state}, ${savedAddress.postalCode}, ${savedAddress.country}`
    : `${savedAddress.city}, ${savedAddress.state}, ${savedAddress.country}`;
  return (
    <div className='saved-gift-card-information-container'>
      <h5> {savedGiftCardInformationHeader} </h5>
      <div className='billing-address-container'>
        <RemoveSavedItemModal
          translate={translate}
          header={deleteBillingAddressHeader}
          cancelText={cancelText}
          onDelete={removeSavedItemModalOnDelete}
        />
        <UpdateBillingAddressModal
          translate={translate}
          systemFeedbackService={systemFeedbackService}
          onUpdateSuccess={(updatedAddress: Address) => {
            setSavedAddress(updatedAddress);
          }}
          address={savedAddress}
        />
        <p className='billing-address-label'>{formattedAddress}</p>
        <button
          type='button'
          className='btn-generic-edit-sm'
          onClick={() => {
            UpdateBillingAddressModalService.open();
          }}>
          <span className='icon-edit' />
        </button>
        <button
          type='button'
          className='btn-generic-trash-bin-sm'
          onClick={() => {
            removeSavedItemModalService.open();
          }}>
          <span className='icon-trash-bin' />
        </button>
      </div>
    </div>
  );
};

export default GiftCardInformation;
