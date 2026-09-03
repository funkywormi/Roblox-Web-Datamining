import React from 'react';
import { useTranslations } from '../../util/translation';
import { Limit } from '../constants';

/**
 * FormField component for multi-line text inputs with character limits.
 * Provides a textarea with label, character count display, and validation.
 * Used for description fields and other long-form text inputs in reports.
 */
export interface FormFieldProps {
  /** Unique identifier for the form field */
  id: string;
  /** Label text or React element to display above the field */
  label: string | React.ReactNode;
  /** Current text value */
  value: string;
  /** Callback when value changes */
  onUpdate: (value: string) => void;
  /** Maximum character length, defaults to MAX_DESCRIPTION_LENGTH */
  maxLength?: number;
  /** Whether to show required asterisk (*) in label */
  showRequiredStar?: boolean;
  /** Number of visible text area rows */
  rows?: number;
  /** Optional error message to display */
  error?: string;
  /** CSS class for container, defaults to 'section' */
  className?: string;
}

const { MAX_DESCRIPTION_LENGTH } = Limit;

/**
 * Reusable textarea component with character limit display and validation.
 * Automatically shows character count and provides consistent styling.
 * Features non-resizable textarea and error display support.
 */
const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  value,
  onUpdate,
  maxLength = MAX_DESCRIPTION_LENGTH,
  showRequiredStar = false,
  rows = 4,
  error,
  className = 'section'
}) => {
  const { translate } = useTranslations();
  const subtitle = `(${translate('Message.DescriptionLimit', { number: maxLength.toString() })})`;
  const asterisk = '*';

  let displayLabel;
  if (showRequiredStar) {
    if (typeof label === 'string') {
      displayLabel = `${label}*`;
    } else {
      displayLabel = (
        <React.Fragment>
          {label}
          {asterisk}
        </React.Fragment>
      );
    }
  } else {
    displayLabel = label;
  }

  return (
    <div id={id} className={className}>
      <h5>{displayLabel}</h5>
      <p className='dsa-reason-limit'>{subtitle}</p>
      <textarea
        className='ticket-message form-control input-field nonresizable'
        value={value}
        rows={rows}
        maxLength={maxLength}
        onChange={e => onUpdate(e.target.value)}
      />
      {error && <span className='text-error field-validation-error'>{error}</span>}
    </div>
  );
};

export default FormField;
