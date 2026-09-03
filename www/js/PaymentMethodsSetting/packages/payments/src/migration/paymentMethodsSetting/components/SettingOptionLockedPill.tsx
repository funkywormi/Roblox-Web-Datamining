import React from 'react';
import { TranslateFunction } from 'react-utilities';
import { TRANSLATION_KEYS } from '../constants/translationConstants';

/* 
  Used to denote whether a setting option is locked behind parental consent
*/

type TSettingOptionLockedPill = {
  translate: TranslateFunction;
};

export const SettingOptionLockedPill = ({ translate }: TSettingOptionLockedPill): JSX.Element => {
  return (
    <div className='setting-option-pill xsmall '>
      <span className='icon-status-private themified-icon' />
      <span className='setting-option-label'>{translate(TRANSLATION_KEYS.ParentLabel)}</span>
    </div>
  );
};

export default SettingOptionLockedPill;
