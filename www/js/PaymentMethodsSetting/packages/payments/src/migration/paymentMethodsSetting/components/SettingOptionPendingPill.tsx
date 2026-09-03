import { TranslateFunction } from 'react-utilities';
import React from 'react';
import { TRANSLATION_KEYS } from '../constants/translationConstants';

/* 
  Used to denote whether a setting option has a pending request for parental consent
*/
type TSettingOptionPendingPill = {
  translate: TranslateFunction;
};

export const SettingOptionPendingPill = ({ translate }: TSettingOptionPendingPill): JSX.Element => {
  return (
    <div className='setting-option-pill xsmall '>
      <span className='icon-uiblox-pending themified-icon' />
      <span className='setting-option-label'>{translate(TRANSLATION_KEYS.Pending)}</span>
    </div>
  );
};

export default SettingOptionPendingPill;
