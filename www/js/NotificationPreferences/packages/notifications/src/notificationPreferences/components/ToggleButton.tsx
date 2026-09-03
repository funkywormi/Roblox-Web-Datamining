import React from 'react';
import classNames from 'classnames';

export type ToggleButtonProps = {
  selectionDisabled?: boolean;
  onChangeCallback?: (newSelection: boolean) => void;
  selection: boolean;
};

const ToggleButton = ({
  selectionDisabled,
  onChangeCallback,
  selection
}: ToggleButtonProps): JSX.Element => {
  const toggleClassName = classNames('btn-toggle receiver-destination-type-toggle', {
    on: selection
  });
  return (
    <button
      type='button'
      role='switch'
      disabled={selectionDisabled}
      aria-checked={selection}
      aria-label='toggle-button'
      className={toggleClassName}
      onClick={() => {
        if (onChangeCallback) {
          onChangeCallback(!selection);
        }
      }}>
      <span className='toggle-flip' />
      <span id='toggle-on' className='toggle-on' />
      <span id='toggle-off' className='toggle-off' />
    </button>
  );
};

export default ToggleButton;
