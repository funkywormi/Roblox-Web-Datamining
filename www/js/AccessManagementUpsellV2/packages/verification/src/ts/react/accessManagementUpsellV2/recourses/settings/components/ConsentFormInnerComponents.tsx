import React from 'react';
import ConsentFormType from '../enums/ConsentFormType';

export interface ConsentFormProps {
  isChecked?: boolean;
  setIsChecked?: (checked: boolean) => void;
  wordsOfConsent: string;
}

// Checkbox Consent Form
const CheckboxConsentForm: React.FC<ConsentFormProps> = ({
  isChecked,
  setIsChecked,
  wordsOfConsent
}) => (
  <div className='small text'>
    <input
      id='consent-checkbox'
      type='checkbox'
      checked={isChecked}
      onChange={() => setIsChecked?.(!isChecked)}
    />
    <label htmlFor='consent-checkbox' className='checkbox-label'>
      {wordsOfConsent}
    </label>
  </div>
);
CheckboxConsentForm.displayName = 'CheckboxConsentForm';

// TODO: Implement Toggle Consent Form
const ToggleConsentForm: React.FC<ConsentFormProps> = () => null;
ToggleConsentForm.displayName = 'ToggleConsentForm';

// Notice Consent Form
const NoticeConsentForm: React.FC<ConsentFormProps> = ({ wordsOfConsent }) => (
  <React.Fragment>{wordsOfConsent}</React.Fragment>
);
NoticeConsentForm.displayName = 'NoticeConsentForm';

export const ConsentFormInnerComponents: Record<ConsentFormType, React.FC<ConsentFormProps>> = {
  [ConsentFormType.Checkbox]: CheckboxConsentForm,
  [ConsentFormType.Toggle]: ToggleConsentForm,
  [ConsentFormType.Notice]: NoticeConsentForm
};
