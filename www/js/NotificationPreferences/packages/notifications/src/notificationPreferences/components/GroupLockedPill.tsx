import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import notificationPreferencesTranslationConfig from '../translation.config';

const GroupLockedPill = ({ translate }: WithTranslationsProps): JSX.Element => {
  return (
    <div className='group-locked-pill xsmall '>
      <span className='icon-status-private themified-icon' />
      <span className='group-locked-label'>{translate('Label.ParentalControls')}</span>
    </div>
  );
};

export default withTranslations(GroupLockedPill, notificationPreferencesTranslationConfig);
