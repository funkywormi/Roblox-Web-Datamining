import React from 'react';
import { WithTranslationsProps, withTranslations } from 'react-utilities';
import { translationConfig } from '../../translation.config';

export type UnavailableFilterComponentProps = {
  includeNotForSale: boolean;
  onUnavailableFilterChanged: (value: boolean) => void;
};

function UnavailableFilterComponent({
  includeNotForSale,
  onUnavailableFilterChanged,
  translate
}: UnavailableFilterComponentProps & WithTranslationsProps): JSX.Element {
  return (
    <ul>
      <li className='radio top-border font-caption-body'>
        <input
          type='radio'
          name='radio-unavailable'
          id='radio-unavailable-hide'
          checked={!includeNotForSale}
          onChange={() => onUnavailableFilterChanged(false)}
        />
        <label htmlFor='radio-unavailable-hide'>{translate('Label.Filter.Hide')}</label>
      </li>
      <li className='radio top-border font-caption-body'>
        <input
          type='radio'
          name='radio-unavailable'
          id='radio-unavailable-show'
          checked={includeNotForSale}
          onChange={() => onUnavailableFilterChanged(true)}
        />
        <label htmlFor='radio-unavailable-show'>{translate('Label.Filter.Show')}</label>
      </li>
    </ul>
  );
}

export default withTranslations(UnavailableFilterComponent, translationConfig);
