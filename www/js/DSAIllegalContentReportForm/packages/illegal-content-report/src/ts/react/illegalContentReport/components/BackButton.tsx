import React from 'react';
import { useTranslations } from '../../util/translation';

/**
 * BackButton component for navigation in form flows.
 * Provides a consistent back button with icon and customizable styling.
 * Used in UK report selector flows and form navigation.
 */
export interface BackButtonProps {
  /** Callback function when back button is clicked */
  onClick: () => void;
  /** Optional custom label, defaults to translated 'Action.Back' */
  label?: string;
  /** Optional additional CSS classes */
  className?: string;
  /** Optional tooltip/title text, defaults to button label */
  title?: string;
}

/**
 * Reusable back button component with consistent styling and behavior.
 * Features an icon and translated label, with support for custom styling.
 */
const BackButton: React.FC<BackButtonProps> = ({ onClick, label, className = '', title }) => {
  const { translate } = useTranslations();

  const buttonLabel = label || translate('Action.Back');
  const buttonTitle = title || buttonLabel;

  return (
    <button
      type='button'
      className={`btn-generic-back-sm back-button ${className}`}
      onClick={onClick}
      title={buttonTitle}>
      <span className='icon-back' />
      {buttonLabel}
    </button>
  );
};

export default BackButton;
