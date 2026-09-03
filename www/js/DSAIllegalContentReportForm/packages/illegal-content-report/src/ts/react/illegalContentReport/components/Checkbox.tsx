import React from 'react';

/**
 * Checkbox component for form inputs with validation support.
 * Provides consistent styling, error display, and required field indicators.
 * Used for confirmations, opt-outs, and boolean form fields.
 */
export interface CheckboxProps {
  /** Unique identifier for the checkbox element */
  id: string;
  /** Current checked state */
  checked: boolean;
  /** Callback when checkbox state changes */
  onChange: (checked: boolean) => void;
  /** Label text to display next to checkbox */
  label: string;
  /** Optional additional CSS classes for container */
  className?: string;
  /** Whether this field is required, adds asterisk to label */
  required?: boolean;
}

/**
 * Reusable checkbox component with built-in validation support.
 * Automatically adds required indicators and error styling.
 * Handles checked state changes and provides accessibility features.
 */
const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onChange,
  label,
  className = '',
  required = false
}) => {
  const requiredLabel = required ? `${label}*` : label;

  return (
    <div className={className}>
      <div className='checkbox'>
        <input
          id={id}
          type='checkbox'
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          required={required}
        />
        <label htmlFor={id} className='checkbox-label'>
          {requiredLabel}
        </label>
      </div>
    </div>
  );
};

export default Checkbox;
