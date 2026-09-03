/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-param-reassign */
import React, { FC, useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { NativeDropdown, Button } from 'react-style-guide';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { EditIcon } from '@rbx/ui';
import { paymentFlowAnalyticsService } from 'core-roblox-utilities';
import { TRIGGERING_CONTEXT } from '../constants/triggeringContext';
import Constants from '../constants/Constants';
import translationConfig from '../translation.config';
import { Address } from '../constants/TypeDefinitions';
import { upsertUserSettingsAddress } from '../services/BillingAddressService';
import SaveBillingInformationCheckBox from './SaveBillingInformationCheckbox';

type EditableFormProps = {
  initialAddress: Address | undefined;
  hasSavedAddress?: boolean; // Indicates whether the initial address is a saved address or a prefilled address.
  processAddressSave?: boolean;
  onUpdateAddress?: (updatedAddress: Address) => void;
  onUpdateSuccess?: () => void;
  onTaxDisplayChange?: (displayTax: boolean) => void;
  hideSaveSection?: boolean;
  triggeringContext: TRIGGERING_CONTEXT;
} & WithTranslationsProps;

const {
  countryLabel: { key: countryLabelKey, default: countryLabelDefault },
  PostalCode: { key: postalCodeLabel, default: postalCodeLabelDefault },
  cityLabel: { key: cityLabel, default: cityLabelDefault },
  stateLabel: { key: stateLabel, default: stateLabelDefault },
  provinceLabel: { key: provinceLabel, default: provinceLabelDefault },
  saveButton: { key: saveButtonKey, default: saveButtonDefault },
  cancelButton: { key: cancelButtonKey, default: cancelButtonDefault },
  approximateUserLocationDescription: {
    key: approximateUserLocationDescription,
    default: approximateUserLocationDescriptionDefault
  }
} = Constants.translations;

const { supportedCountries, countryToStates } = Constants;
// Required field indicator
const REQUIRED_SYMBOL = '*';
const DEFAULT_COUNTRY_CODE = 'US';
const CITY_MIN_LENGTH = 2;
const US_POSTAL_CODE_LENGTH = 5;
const SELECT_STATE_PLACEHOLDER = 'Select State';
const SELECT_PROVINCE_PLACEHOLDER = 'Select Province';
const RequiredIndicator: FC = () => <span className='required-indicator'>{REQUIRED_SYMBOL}</span>;

const EditableForm: React.FC<EditableFormProps> = ({
  initialAddress,
  hasSavedAddress,
  processAddressSave,
  onUpdateAddress,
  onUpdateSuccess,
  onTaxDisplayChange,
  hideSaveSection,
  triggeringContext,
  translate
}) => {
  const [isEditing, setIsEditing] = useState(!hasSavedAddress);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(
    initialAddress?.country ?? DEFAULT_COUNTRY_CODE
  );
  const [selectedBillingState, setSelectedBillingState] = useState(initialAddress?.state ?? '');
  // The draft postal code while user is still typing.
  const [draftPostalCode, setDraftPostalCode] = useState(initialAddress?.postalCode ?? '');
  const [localPostalCode, setLocalPostalCode] = useState(initialAddress?.postalCode ?? '');
  const [city, setCity] = useState(initialAddress?.city ?? '');
  // The draft city while user is still typing.
  const [draftCity, setDraftCity] = useState(initialAddress?.city ?? '');

  // Simple flag to skip first render
  const isFirstRender = useRef(true);

  const postalCodeFieldLabel = translate(postalCodeLabel) || postalCodeLabelDefault;
  const cityFieldLabel = translate(cityLabel) || cityLabelDefault;
  const countryOptions = supportedCountries.map(country => ({
    value: country.code,
    label: country.displayName
  }));
  const postalCodeEnabled = selectedCountryCode === DEFAULT_COUNTRY_CODE;
  const [shouldSaveBillingInfo, setShouldSaveBillingInfo] = useState(true);
  const [saveButtonEnabled, setSaveButtonEnabled] = useState(false);
  const [savedAddress, setSavedAddress] = useState(hasSavedAddress ? initialAddress : undefined);
  const showSaveButton = hasSavedAddress;

  useEffect(() => {
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      triggeringContext,
      true, // isMidPurchaseStep
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.CREDIT_BALANCE_BIILLING_ADDRESS_FORM, // viewName
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.VIEW_SHOWN, // purchaseEventType
      undefined, // viewMessage
      {
        initial_address_available: initialAddress ? 'true' : 'false',
        has_saved_address: hasSavedAddress ? 'true' : 'false'
      } // eventMetadata
    );
  }, [hasSavedAddress, initialAddress, triggeringContext]);

  const handleEditButtonClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const processUpsertUserSettingAddress = useCallback(async () => {
    try {
      const response = await upsertUserSettingsAddress({
        country: selectedCountryCode,
        state: selectedBillingState,
        city,
        postalCode: localPostalCode
      });
      if (response.status === 200) {
        onUpdateSuccess?.();
        setSavedAddress({
          country: selectedCountryCode,
          state: selectedBillingState,
          city,
          postalCode: localPostalCode
        });
      }
    } catch (error: unknown) {
      // no-op since we allow user to fill in the address when there is nothing saved.
    }
  }, [selectedCountryCode, selectedBillingState, city, localPostalCode, onUpdateSuccess]);

  useEffect(() => {
    // This is for external components to trigger address save, for example, when user clicks the submit order button.
    if (processAddressSave) {
      // if the checkbox is present(!hideSaveSection && !showSaveButton), skip if the checkbox is not checked.
      if (!hideSaveSection && !showSaveButton && !shouldSaveBillingInfo) {
        return;
      }

      // If the save button is present(!hideSaveSection && showSaveButton), always skip.
      if (!hideSaveSection && showSaveButton) {
        return;
      }

      // eslint-disable-next-line no-void
      void processUpsertUserSettingAddress();
    }
  }, [
    processAddressSave,
    selectedCountryCode,
    selectedBillingState,
    city,
    localPostalCode,
    onUpdateSuccess,
    shouldSaveBillingInfo,
    processUpsertUserSettingAddress,
    hideSaveSection,
    showSaveButton
  ]);

  // Private validation helper functions
  const isValidCity = useCallback((cityValue: string): boolean => {
    return !!(cityValue && cityValue.length >= CITY_MIN_LENGTH);
  }, []);

  const isValidState = useCallback((stateValue: string): boolean => {
    return !!stateValue;
  }, []);

  const isValidUSPostalCode = useCallback((postalCodeValue: string): boolean => {
    return !!(postalCodeValue && postalCodeValue.length === US_POSTAL_CODE_LENGTH);
  }, []);

  const validateAddressInput = useCallback(() => {
    switch (selectedCountryCode) {
      case 'US':
        return (
          isValidCity(city) &&
          isValidState(selectedBillingState) &&
          isValidUSPostalCode(localPostalCode)
        );
      case 'CA':
        return isValidCity(city) && isValidState(selectedBillingState);
      default:
        return false;
    }
  }, [
    selectedCountryCode,
    selectedBillingState,
    city,
    localPostalCode,
    isValidCity,
    isValidState,
    isValidUSPostalCode
  ]);

  useEffect(() => {
    if (!hideSaveSection && showSaveButton) {
      onTaxDisplayChange?.(validateAddressInput() && !isEditing);
    } else {
      onTaxDisplayChange?.(validateAddressInput());
    }
  }, [hideSaveSection, showSaveButton, isEditing, validateAddressInput, onTaxDisplayChange]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (hasSavedAddress) {
        // Skip the first render to avoid triggering onUpdateAddress on mount if there is saved address
        return;
      }
    }

    // If the address is not valid, don't trigger onUpdateAddress.
    if (!validateAddressInput()) {
      return;
    }

    onUpdateAddress?.({
      country: selectedCountryCode,
      state: selectedBillingState,
      city,
      postalCode: localPostalCode
    });
  }, [
    validateAddressInput,
    selectedCountryCode,
    selectedBillingState,
    city,
    localPostalCode,
    onUpdateAddress
  ]);

  const validateDraftAddressInput = useCallback(() => {
    switch (selectedCountryCode) {
      case 'US':
        return (
          isValidCity(draftCity) &&
          isValidState(selectedBillingState) &&
          isValidUSPostalCode(draftPostalCode)
        );
      case 'CA':
        return isValidCity(draftCity) && isValidState(selectedBillingState);
      default:
        return false;
    }
  }, [
    selectedCountryCode,
    selectedBillingState,
    draftCity,
    draftPostalCode,
    isValidCity,
    isValidState,
    isValidUSPostalCode
  ]);

  const sameWithSavedAddress = useCallback(() => {
    return (
      selectedCountryCode === savedAddress?.country &&
      selectedBillingState === savedAddress?.state &&
      city === savedAddress?.city &&
      localPostalCode === savedAddress?.postalCode
    );
  }, [selectedCountryCode, selectedBillingState, city, localPostalCode, savedAddress]);

  useEffect(() => {
    if (sameWithSavedAddress()) {
      return;
    }
    setSaveButtonEnabled(validateDraftAddressInput());
  }, [validateDraftAddressInput, sameWithSavedAddress]);

  const handlePostalCodeChange = useCallback(() => {
    setLocalPostalCode(draftPostalCode);
  }, [draftPostalCode]);

  const handleCityChange = useCallback(() => {
    setCity(draftCity);
  }, [draftCity]);

  const handleCountryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    setSelectedCountryCode(newCountry);
    setSelectedBillingState('');

    setCity('');
    setDraftCity('');
    setLocalPostalCode('');
    setDraftPostalCode('');
  }, []);

  const handleBillingStateChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      // If the selected state is not supported for the selected country, reset the state.
      // Technically this shouldn't happen since the dropdown is disabled if the state is not supported.
      // But the CoreUI NativeDropdown allows placeholder to be selected on Safari.
      // So we need to perform this sanity check.
      const supportedStates = countryToStates[selectedCountryCode] ?? [];
      if (!supportedStates.some(state => state.value === e.target.value)) {
        setSelectedBillingState('');
        setLocalPostalCode('');
        setDraftPostalCode('');
        return;
      }
      setSelectedBillingState(e.target.value);
      setLocalPostalCode('');
      setDraftPostalCode('');
    },
    [selectedCountryCode]
  );

  const countryField = useMemo(() => {
    return (
      <div className='country-field'>
        <label htmlFor='country-select' className='form-label'>
          {translate(countryLabelKey) || countryLabelDefault} <RequiredIndicator />
        </label>
        <NativeDropdown
          id='country-select'
          selectionItems={countryOptions}
          selectedItemvalue={selectedCountryCode}
          onChange={handleCountryChange}
          className='country-select-container'
        />
      </div>
    );
  }, [countryOptions, handleCountryChange, selectedCountryCode, translate]);

  const cityField = useMemo(() => {
    return (
      <div className='city-field'>
        <label htmlFor='city-input' className='form-label'>
          {cityFieldLabel} <RequiredIndicator />
        </label>
        <div className='city-input-container'>
          <input
            id='city-input'
            type='text'
            value={draftCity}
            onChange={e => {
              setDraftCity(e.target.value);
            }}
            onBlur={handleCityChange}
            placeholder={cityFieldLabel}
          />
        </div>
      </div>
    );
  }, [cityFieldLabel, draftCity, handleCityChange]);

  const stateField = useMemo(() => {
    const placeholder =
      selectedCountryCode === DEFAULT_COUNTRY_CODE
        ? SELECT_STATE_PLACEHOLDER
        : SELECT_PROVINCE_PLACEHOLDER;

    return (
      <div className='state-field'>
        <label htmlFor='state-select' className='form-label'>
          {selectedCountryCode === DEFAULT_COUNTRY_CODE
            ? translate(stateLabel) || stateLabelDefault
            : translate(provinceLabel) || provinceLabelDefault}{' '}
          <RequiredIndicator />
        </label>
        <NativeDropdown
          id='state-select'
          placeholder={placeholder}
          selectionItems={countryToStates[selectedCountryCode] ?? []}
          selectedItemvalue={selectedBillingState || placeholder}
          onChange={handleBillingStateChange}
          className='state-select-container'
        />
      </div>
    );
  }, [handleBillingStateChange, selectedBillingState, selectedCountryCode, translate]);

  const zipcodeField = useMemo(() => {
    return (
      <div className='zip-code-field'>
        <label htmlFor='zip-code-input' className='form-label'>
          {postalCodeFieldLabel} <RequiredIndicator />
        </label>
        <div className='postal-code-input-container'>
          <input
            id='postal-code-input'
            type='text'
            inputMode={selectedCountryCode === 'US' ? 'numeric' : 'text'}
            pattern={selectedCountryCode === 'US' ? '[0-9]*' : undefined}
            value={draftPostalCode}
            onBlur={handlePostalCodeChange}
            onChange={e => {
              const newPostalCode = e.target.value;
              if (!/^\d*$/.test(newPostalCode)) {
                return;
              }
              setDraftPostalCode(newPostalCode);
              // Special postal code logic for US only: auto-commit when user reaches 5 characters
              // This provides faster validation feedback for complete US postal codes
              if (selectedCountryCode === 'US' && newPostalCode.length === US_POSTAL_CODE_LENGTH) {
                setLocalPostalCode(newPostalCode);
              }
            }}
            placeholder={postalCodeFieldLabel}
            maxLength={selectedCountryCode === 'US' ? 5 : undefined}
          />
        </div>
      </div>
    );
  }, [postalCodeFieldLabel, selectedCountryCode, draftPostalCode, handlePostalCodeChange]);

  const renderBillingAddressFields = useCallback(() => {
    if (postalCodeEnabled) {
      return (
        <div className='form-group billing-address-form-group'>
          <div className='billing-fields-row'>
            {countryField}
            {cityField}
          </div>
          <div className='billing-fields-row'>
            {stateField}
            {zipcodeField}
          </div>
        </div>
      );
    }

    return (
      <div className='form-group billing-address-form-group'>
        <div className='billing-fields-row'>{countryField}</div>
        <div className='billing-fields-row'>
          {cityField}
          {stateField}
        </div>
      </div>
    );
  }, [cityField, countryField, postalCodeEnabled, stateField, zipcodeField]);

  const handleSaveClick = useCallback(() => {
    // eslint-disable-next-line no-void
    void processUpsertUserSettingAddress();
    setIsEditing(false);
    setSaveButtonEnabled(false);
  }, [processUpsertUserSettingAddress, setIsEditing, setSaveButtonEnabled]);

  const handleCancelClick = useCallback(() => {
    // Reset the postal code, city, state, and country to the saved address.
    setLocalPostalCode(savedAddress?.postalCode ?? '');
    setDraftPostalCode(savedAddress?.postalCode ?? '');
    setCity(savedAddress?.city ?? '');
    setDraftCity(savedAddress?.city ?? '');
    setSelectedBillingState(savedAddress?.state ?? '');
    setSelectedCountryCode(savedAddress?.country ?? DEFAULT_COUNTRY_CODE);
    setIsEditing(false);
  }, [savedAddress, setLocalPostalCode, setCity, setSelectedBillingState, setSelectedCountryCode]);

  const renderSaveSection = useMemo(() => {
    if (showSaveButton) {
      return (
        <div className='billing-address-buttons'>
          <Button
            variant={Button.variants.growth}
            size={Button.sizes.medium}
            width={Button.widths.default}
            onClick={handleSaveClick}
            className='mr-2 save-address-button'
            isDisabled={!saveButtonEnabled}>
            {translate(saveButtonKey) || saveButtonDefault}
          </Button>

          <Button
            variant={Button.variants.control}
            size={Button.sizes.medium}
            width={Button.widths.default}
            onClick={handleCancelClick}
            className='ml-2 cancel-address-button'>
            {translate(cancelButtonKey) || cancelButtonDefault}
          </Button>
        </div>
      );
    }

    return (
      <SaveBillingInformationCheckBox
        saveBillingInfo={shouldSaveBillingInfo}
        setSaveBillingInfo={setShouldSaveBillingInfo}
      />
    );
  }, [
    handleCancelClick,
    handleSaveClick,
    saveButtonEnabled,
    shouldSaveBillingInfo,
    showSaveButton,
    translate
  ]);

  // Early return for non-editable state.
  if (!isEditing) {
    const formattedAddress = postalCodeEnabled
      ? `${savedAddress?.city}, ${savedAddress?.state}, ${savedAddress?.postalCode}, ${savedAddress?.country}`
      : `${savedAddress?.city}, ${savedAddress?.state}, ${savedAddress?.country}`;
    return (
      <div className='formatted-address-container'>
        <p className='formatted-address-label'>{formattedAddress}</p>
        <button
          type='button'
          onClick={handleEditButtonClick}
          aria-label='Edit billing address'
          className='edit-address-button'>
          <EditIcon />
        </button>
      </div>
    );
  }

  return (
    <div className='billing-address-form-container'>
      {/* when hideSaveSection is true, we don't want to show the description. */}
      {!hideSaveSection && (
        <p className='approximate-user-location-label'>
          {translate(approximateUserLocationDescription) ||
            approximateUserLocationDescriptionDefault}
        </p>
      )}
      {renderBillingAddressFields()}
      {!hideSaveSection && renderSaveSection}
    </div>
  );
};

export default withTranslations(EditableForm, translationConfig);
