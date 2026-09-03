import ClassNames from 'classnames';
import React from 'react';

export type TimePreferenceSelectorProps = {
  localizedDescription: string;
  timeString: string;
  selectionDisabled?: boolean;
  onClick: () => void;
};

const TimePreferenceSelector = ({
  localizedDescription,
  timeString,
  selectionDisabled,
  onClick
}: TimePreferenceSelectorProps): JSX.Element => {
  return (
    <div className='preference-selector'>
      <div
        className={ClassNames('preference-selector-header', {
          'text-disabled': selectionDisabled
        })}>
        <div className='notification-type-info'>
          <div className='notification-type-descriptor small text text-content'>
            {localizedDescription}
          </div>
        </div>
        <button
          className='time-preference-selector-button'
          type='button'
          disabled={selectionDisabled}
          onClick={onClick}>
          <span className='small text text-content'>{timeString}</span>
          <span className='icon-chevron-heavy-right' />
        </button>
      </div>
    </div>
  );
};

export default TimePreferenceSelector;
