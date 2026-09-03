import React, { useEffect, useState } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { paymentFlowAnalyticsService } from 'core-roblox-utilities';
import { TRIGGERING_CONTEXT } from '../constants/triggeringContext';
import translationConfig from '../translation.config';
import EditableForm from './EditableForm';
import {
  getApproximateUserLocation,
  getUserSettingsAddress
} from '../services/BillingAddressService';
import { Address } from '../constants/TypeDefinitions';
import Constants from '../constants/Constants';

const { supportedCountries, countryToStates } = Constants;

type BillingAddressFormProps = {
  processAddressSave?: boolean;
  onUpdateAddress?: (updatedAddress: Address) => void;
  prefilledAddress?: Address;
  onUpdateSuccess?: () => void;
  onTaxDisplayChange?: (displayTax: boolean) => void;
  hideSaveSection?: boolean;
  onSavedAddressLoaded?: (address: Address | undefined) => void;
  triggeringContext: TRIGGERING_CONTEXT;
} & WithTranslationsProps;

const {
  billingInformationHeader: {
    key: billingInformationHeader,
    default: billingInformationHeaderDefault
  }
} = Constants.translations;

const BillingAddressForm: React.FC<BillingAddressFormProps> = ({
  processAddressSave,
  onUpdateAddress,
  prefilledAddress,
  onUpdateSuccess,
  onTaxDisplayChange,
  hideSaveSection,
  onSavedAddressLoaded,
  triggeringContext,
  translate
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [savedAddress, setSavedAddress] = useState<Address>();
  const [approximateUserLocation, setApproximateUserLocation] = useState<Address>();

  useEffect(() => {
    // If a prefilled address is provided, use it instead of fetching saved address
    if (prefilledAddress) {
      onSavedAddressLoaded?.(undefined);
      setIsLoading(false);
      return;
    }

    const getUserSettingAddressAndSet = async () => {
      try {
        const {
          data: {
            address: { country, state, city, postalCode }
          }
        } = await getUserSettingsAddress();
        const savedAddr = { country, state, city, postalCode };
        setSavedAddress(savedAddr);
        onSavedAddressLoaded?.(savedAddr);
      } catch (error: unknown) {
        onSavedAddressLoaded?.(undefined);
      }
    };

    const getApproximateUserLocationAndSet = async () => {
      try {
        const {
          data: { countryCode, subdivision, city, postalCode }
        } = await getApproximateUserLocation();
        paymentFlowAnalyticsService.sendUserPurchaseStatusEvent(
          triggeringContext,
          paymentFlowAnalyticsService.ENUM_PURCHASE_STATUS.PASSED_GET_APPROXIMATE_USER_LOCATION,
          undefined,
          paymentFlowAnalyticsService.ENUM_VIEW_NAME.CREDIT_BALANCE_BIILLING_ADDRESS_FORM
        );
        // check to see if the country code and subdivision are supported
        if (
          supportedCountries.some(supportedCountry => supportedCountry.code === countryCode) &&
          countryToStates[countryCode]?.some(state => state.value === subdivision)
        ) {
          setApproximateUserLocation({
            country: countryCode,
            state: subdivision,
            city,
            postalCode
          });
        }
      } catch (error: unknown) {
        // ignore error since this approximate user location is nice to have.
        paymentFlowAnalyticsService.sendUserPurchaseStatusEvent(
          triggeringContext,
          paymentFlowAnalyticsService.ENUM_PURCHASE_STATUS.FAILED_GET_APPROXIMATE_USER_LOCATION,
          undefined,
          paymentFlowAnalyticsService.ENUM_VIEW_NAME.CREDIT_BALANCE_BIILLING_ADDRESS_FORM
        );
      }
    };

    // Wait for both async functions to complete before setting loading to false
    const loadData = async () => {
      await Promise.all([getUserSettingAddressAndSet(), getApproximateUserLocationAndSet()]);
      setIsLoading(false);
    };

    // eslint-disable-next-line no-void
    void loadData();
  }, [prefilledAddress, onSavedAddressLoaded]);

  if (isLoading) {
    return null;
  }

  return (
    <div className='billing-info-container'>
      <h5 className='billing-info-title'>
        {translate(billingInformationHeader) || billingInformationHeaderDefault}
      </h5>
      <EditableForm
        processAddressSave={processAddressSave}
        initialAddress={prefilledAddress ?? savedAddress ?? approximateUserLocation}
        hasSavedAddress={savedAddress !== undefined}
        onUpdateAddress={onUpdateAddress}
        onUpdateSuccess={onUpdateSuccess}
        onTaxDisplayChange={onTaxDisplayChange}
        hideSaveSection={hideSaveSection}
        triggeringContext={triggeringContext}
      />
    </div>
  );
};

export default withTranslations(BillingAddressForm, translationConfig);
