import React from 'react';
import { useTranslations } from '../../util/translation';
import { getSampleRobloxUrl } from '../../util/urls';
import { Limit } from '../constants';

/**
 * UrlInput component for collecting Roblox content URLs.
 * Provides a text input with placeholder showing sample URL format.
 * Displays validation errors passed from parent form components.
 */
export interface UrlInputProps {
  /** Current URL value */
  value: string;
  /** Callback when URL changes */
  onChange: (value: string) => void;
  /** Translation key for the label text */
  labelKey: string;
  /** Whether to add asterisk after label */
  addStar?: boolean;
  /** Optional CSS class for container */
  className?: string;
  /** Test ID for automated testing */
  testId?: string;
  /** Error message to display, provided by parent form validation */
  error?: string;
}

/**
 * Reusable URL input component with consistent styling and validation display.
 * Features automatic placeholder with sample URL and character limits.
 * Error handling is managed by parent components for flexible validation.
 */
const UrlInput: React.FC<UrlInputProps> = ({
  value,
  onChange,
  labelKey,
  addStar = false,
  className = '',
  testId = 'url-textbox',
  error
}) => {
  const { translate } = useTranslations();

  return (
    <div id='url-input' className={className}>
      <h5>{addStar ? `${translate(labelKey)}*` : translate(labelKey)}</h5>
      <input
        type='text'
        data-testid={testId}
        className='form-control input-field'
        value={value}
        placeholder={`${translate('Message.UrlSample')}: ${getSampleRobloxUrl()}`}
        maxLength={Limit.MAX_URL_LENGTH}
        onChange={e => onChange(e.target.value)}
      />
      {error && <span className='error-text'>{error}</span>}
    </div>
  );
};

export default UrlInput;
