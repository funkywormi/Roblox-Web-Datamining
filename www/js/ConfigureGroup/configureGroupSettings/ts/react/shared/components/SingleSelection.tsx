import React from 'react';
import { RadioGroup, Radio } from '@rbx/foundation-ui';

export interface SelectionOption {
  value: string;
  label: string;
  description?: string;
}

export type SingleSelectionProps = {
  options: SelectionOption[];
  value: string;
  onChange: (value: string) => void;
  header: string;
  subheader?: string;
  disabled?: boolean;
};

export const SingleSelection: React.FC<SingleSelectionProps> = ({
  options,
  value,
  onChange,
  header,
  subheader,
  disabled
}) => {
  return (
    <div className='single-selection-section'>
      <h4 className='single-selection-header text-body-large padding-y-none'>{header}</h4>
      {subheader && (
        <p className='single-selection-subheader text-secondary text-caption-medium padding-top-xsmall'>
          {subheader}
        </p>
      )}
      <RadioGroup
        className='single-selection-radio-group padding-left-medium padding-top-small'
        value={value}
        disabled={disabled}
        onValueChange={onChange}>
        {options.map(option => (
          <Radio
            key={option.value}
            value={option.value}
            label={option.label}
            aria-label={option.label}
            hint={option.description}
          />
        ))}
      </RadioGroup>
    </div>
  );
};

export default SingleSelection;
