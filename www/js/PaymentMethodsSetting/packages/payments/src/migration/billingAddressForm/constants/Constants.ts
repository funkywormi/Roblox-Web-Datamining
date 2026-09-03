const translations = {
  countryLabel: {
    key: 'Label.BillingAddress.Country',
    default: 'Country'
  },
  PostalCode: {
    key: 'Label.BillingAddress.PostalCode',
    default: 'Postal Code'
  },
  cityLabel: {
    key: 'Label.BillingAddress.City',
    default: 'City'
  },
  stateLabel: {
    key: 'Label.BillingAddress.State',
    default: 'State'
  },
  provinceLabel: {
    key: 'Label.BillingAddress.Province',
    default: 'Province'
  },
  saveBillingInformationLabel: {
    key: 'Button.BillingAddress.SaveBillingInformation',
    default: 'Save Billing Information'
  },
  billingInformationHeader: {
    key: 'Header.BillingAddress.BillingInformation',
    default: 'Billing Information'
  },
  approximateUserLocationDescription: {
    key: 'Description.BillingAddress.ApproximateUserLocation',
    default:
      'Please enter your address so we can accurately calculate tax. In some cases we may use your device’s location.'
  },
  saveButton: {
    key: 'Button.BillingAddress.Save',
    default: 'Save'
  },
  cancelButton: {
    key: 'Button.BillingAddress.Cancel',
    default: 'Cancel'
  }
};

const countryToStates: Record<string, { label: string; value: string }[]> = {
  US: [
    { label: 'Alabama', value: 'Alabama' },
    { label: 'Alaska', value: 'Alaska' },
    { label: 'Arizona', value: 'Arizona' },
    { label: 'Arkansas', value: 'Arkansas' },
    { label: 'California', value: 'California' },
    { label: 'Colorado', value: 'Colorado' },
    { label: 'Connecticut', value: 'Connecticut' },
    { label: 'Delaware', value: 'Delaware' },
    { label: 'District of Columbia', value: 'District of Columbia' },
    { label: 'Florida', value: 'Florida' },
    { label: 'Georgia', value: 'Georgia' },
    { label: 'Hawaii', value: 'Hawaii' },
    { label: 'Idaho', value: 'Idaho' },
    { label: 'Illinois', value: 'Illinois' },
    { label: 'Indiana', value: 'Indiana' },
    { label: 'Iowa', value: 'Iowa' },
    { label: 'Kansas', value: 'Kansas' },
    { label: 'Kentucky', value: 'Kentucky' },
    { label: 'Louisiana', value: 'Louisiana' },
    { label: 'Maine', value: 'Maine' },
    { label: 'Maryland', value: 'Maryland' },
    { label: 'Massachusetts', value: 'Massachusetts' },
    { label: 'Michigan', value: 'Michigan' },
    { label: 'Minnesota', value: 'Minnesota' },
    { label: 'Mississippi', value: 'Mississippi' },
    { label: 'Missouri', value: 'Missouri' },
    { label: 'Montana', value: 'Montana' },
    { label: 'Nebraska', value: 'Nebraska' },
    { label: 'Nevada', value: 'Nevada' },
    { label: 'New Hampshire', value: 'New Hampshire' },
    { label: 'New Jersey', value: 'New Jersey' },
    { label: 'New Mexico', value: 'New Mexico' },
    { label: 'New York', value: 'New York' },
    { label: 'North Carolina', value: 'North Carolina' },
    { label: 'North Dakota', value: 'North Dakota' },
    { label: 'Ohio', value: 'Ohio' },
    { label: 'Oklahoma', value: 'Oklahoma' },
    { label: 'Oregon', value: 'Oregon' },
    { label: 'Pennsylvania', value: 'Pennsylvania' },
    { label: 'Rhode Island', value: 'Rhode Island' },
    { label: 'South Carolina', value: 'South Carolina' },
    { label: 'South Dakota', value: 'South Dakota' },
    { label: 'Tennessee', value: 'Tennessee' },
    { label: 'Texas', value: 'Texas' },
    { label: 'Utah', value: 'Utah' },
    { label: 'Vermont', value: 'Vermont' },
    { label: 'Virginia', value: 'Virginia' },
    { label: 'Washington', value: 'Washington' },
    { label: 'West Virginia', value: 'West Virginia' },
    { label: 'Wisconsin', value: 'Wisconsin' },
    { label: 'Wyoming', value: 'Wyoming' },
    { label: 'Guam', value: 'Guam' },
    { label: 'Puerto Rico', value: 'Puerto Rico' }
  ],
  CA: [
    { label: 'Alberta', value: 'Alberta' },
    { label: 'British Columbia', value: 'British Columbia' },
    { label: 'Manitoba', value: 'Manitoba' },
    { label: 'New Brunswick', value: 'New Brunswick' },
    { label: 'Newfoundland and Labrador', value: 'Newfoundland and Labrador' },
    { label: 'Nova Scotia', value: 'Nova Scotia' },
    { label: 'Ontario', value: 'Ontario' },
    { label: 'Prince Edward Island', value: 'Prince Edward Island' },
    { label: 'Quebec', value: 'Quebec' },
    { label: 'Saskatchewan', value: 'Saskatchewan' },
    { label: 'Northwest Territories', value: 'Northwest Territories' },
    { label: 'Nunavut', value: 'Nunavut' },
    { label: 'Yukon', value: 'Yukon' }
  ]
};

export type CountryRegion = {
  code: string;
  name: string;
  displayName: string;
};

const supportedCountries: CountryRegion[] = [
  {
    code: 'US',
    name: 'United States',
    displayName: 'United States'
  },
  {
    code: 'CA',
    name: 'Canada',
    displayName: 'Canada'
  }
];

export default {
  translations,
  countryToStates,
  supportedCountries
};
