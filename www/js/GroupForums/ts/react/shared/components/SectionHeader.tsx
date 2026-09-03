import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import classNames from 'classnames';
import { groupsConfig } from '../translation.config';

export type SectionHeaderProps = {
  containerClassName?: string;
  headerText: string;
  onBack: () => void;
} & WithTranslationsProps;

const SectionHeader = ({
  headerText,
  containerClassName,
  onBack,
  translate
}: SectionHeaderProps): JSX.Element => {
  return (
    <div className={classNames('groups-section-header', containerClassName)}>
      <button
        className='groups-section-header-back icon-left'
        type='button'
        aria-label={translate('Action.Back')}
        onClick={onBack}
      />
      <h2 className='groups-section-header-text'>{headerText}</h2>
      <div className='groups-section-header-spacer' />
    </div>
  );
};

export default withTranslations(SectionHeader, groupsConfig);
