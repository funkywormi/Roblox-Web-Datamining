import React from 'react';
import { useTranslation } from 'react-utilities';
import classNames from 'classnames';
import { Chip, TChipProps } from '@rbx/foundation-ui';
import { Gender } from '../../../common/types/signupTypes';

export type GenderInputProps = {
  gender: Gender;
  isDisabled?: boolean;
  onChange: (gender: Gender) => void;
};

const GenderInput = ({ gender, isDisabled, onChange }: GenderInputProps): JSX.Element => {
  const { translate } = useTranslation();
  const labelId = 'signup-gender-label';
  return (
    <div role='group' aria-labelledby={labelId} className='flex flex-col gap-small'>
      <span
        id={labelId}
        className={classNames('text-title-medium content-emphasis', isDisabled && 'opacity-[0.5]')}>
        {translate('Label.OptionalGender')}
      </span>
      <div className='flex gap-small'>
        <Chip
          size='Large'
          text={translate('Label.Male')}
          // We are using a temporary custom icon, since gender icons are expected to be overhauled
          // later and provided as proper Foundation icons.
          leadingIconName={
            (gender === Gender.male
              ? 'icon-filled-male-custom'
              : 'icon-regular-male-custom') as TChipProps['leadingIconName']
          }
          className='min-width-3000'
          isChecked={gender === Gender.male}
          isDisabled={isDisabled}
          onCheckedChange={enabled => onChange(enabled ? Gender.male : Gender.unknown)}
        />
        <Chip
          size='Large'
          text={translate('Label.Female')}
          // We are using a temporary custom icon, since gender icons are expected to be overhauled
          // later and provided as proper Foundation icons.
          leadingIconName={
            (gender === Gender.female
              ? 'icon-filled-female-custom'
              : 'icon-regular-female-custom') as TChipProps['leadingIconName']
          }
          className='min-width-3000'
          isChecked={gender === Gender.female}
          isDisabled={isDisabled}
          onCheckedChange={enabled => onChange(enabled ? Gender.female : Gender.unknown)}
        />
      </div>
    </div>
  );
};

export default GenderInput;
