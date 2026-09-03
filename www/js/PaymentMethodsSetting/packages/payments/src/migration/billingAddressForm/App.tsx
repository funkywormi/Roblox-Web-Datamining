import React from 'react';
import { TRIGGERING_CONTEXT } from './constants/triggeringContext';
import BillingAddressForm from './components/BillingAddressForm';
import './billingAddressForm.scss';

import { Address } from './constants/TypeDefinitions';

type BillingAddressFormProps = {
  processAddressSave?: boolean;
  onUpdateAddress?: (updatedAddress: Address) => void;
  prefilledAddress?: Address;
  onUpdateSuccess?: () => void;
  onTaxDisplayChange?: (displayTax: boolean) => void;
  hideSaveSection?: boolean;
  onSavedAddressLoaded?: (address: Address | undefined) => void;
  triggeringContext: TRIGGERING_CONTEXT;
};

const App: React.FC<BillingAddressFormProps> = ({
  processAddressSave,
  onUpdateAddress,
  prefilledAddress,
  onUpdateSuccess,
  onTaxDisplayChange,
  hideSaveSection,
  onSavedAddressLoaded,
  triggeringContext
}) => {
  return (
    <BillingAddressForm
      processAddressSave={processAddressSave}
      onUpdateAddress={onUpdateAddress}
      prefilledAddress={prefilledAddress}
      onUpdateSuccess={onUpdateSuccess}
      onTaxDisplayChange={onTaxDisplayChange}
      hideSaveSection={hideSaveSection}
      onSavedAddressLoaded={onSavedAddressLoaded}
      triggeringContext={triggeringContext}
    />
  );
};

export default App;
