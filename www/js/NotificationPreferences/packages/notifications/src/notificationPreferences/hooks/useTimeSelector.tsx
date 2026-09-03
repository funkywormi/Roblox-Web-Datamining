import React, { useState, useEffect } from 'react';
import ClassNames from 'classnames';
import { NativeDropdown } from 'react-style-guide';
import {
  minutesToTimeComponents,
  timeComponentsToMinutes,
  generateHourOptions,
  generateMinuteOptions,
  generateAmPmOptions
} from '../utils/doNotDisturbUtils';

export type TTimeComponents = {
  hour: number;
  minute: number;
  isPM: boolean;
};

const useTimeSelector = (
  initialMinutes: number,
  hourLabel: string,
  minuteLabel: string,
  ampmLabel: string,
  amLabel: string,
  pmLabel: string
): [number, JSX.Element, (minutes: number) => void, boolean] => {
  const [selectedTime, setSelectedTime] = useState<TTimeComponents>({
    hour: 12,
    minute: 0,
    isPM: false
  });
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (initialMinutes >= 0) {
      const timeComponents = minutesToTimeComponents(initialMinutes);
      setSelectedTime(timeComponents);
    }
  }, [initialMinutes]);

  const handleTimeSelection = (partName: string, value: string) => {
    const newTime = { ...selectedTime };

    if (partName === 'hour') {
      newTime.hour = Number(value);
    } else if (partName === 'minute') {
      newTime.minute = Number(value);
    } else if (partName === 'ampm') {
      newTime.isPM = value === 'PM';
    }

    setSelectedTime(newTime);
    setErrorMessage(undefined);
  };

  const resetTime = (minutes: number) => {
    if (minutes >= 0) {
      const timeComponents = minutesToTimeComponents(minutes);
      setSelectedTime(timeComponents);
    }
    setErrorMessage(undefined);
  };

  const isTimeValid = !errorMessage;
  const selectedMinutes = timeComponentsToMinutes(
    selectedTime.hour,
    selectedTime.minute,
    selectedTime.isPM
  );

  const hourOptions = generateHourOptions();
  const minuteOptions = generateMinuteOptions();
  const ampmOptions = generateAmPmOptions(amLabel, pmLabel);

  const timeSelector = (
    <React.Fragment>
      <div id='time-dropdown' className='time-container form-group'>
        <div className='time-dropdown-row'>
          <div className='time-dropdown-item'>
            <label className='time-dropdown-label' htmlFor='hour-dropdown'>
              {hourLabel}
            </label>
            <NativeDropdown
              id='hour-dropdown'
              selectedItemvalue={selectedTime.hour.toString()}
              selectionItems={hourOptions}
              className={ClassNames('rbx-select-group time-select-group')}
              onChange={e => {
                const { value } = e.target;
                handleTimeSelection('hour', value);
              }}
            />
          </div>
          <div className='time-dropdown-item'>
            <label className='time-dropdown-label' htmlFor='minute-dropdown'>
              {minuteLabel}
            </label>
            <NativeDropdown
              id='minute-dropdown'
              selectedItemvalue={selectedTime.minute.toString()}
              selectionItems={minuteOptions}
              className={ClassNames('rbx-select-group time-select-group')}
              onChange={e => {
                const { value } = e.target;
                handleTimeSelection('minute', value);
              }}
            />
          </div>
          <div className='time-dropdown-item'>
            <label className='time-dropdown-label' htmlFor='ampm-dropdown'>
              {ampmLabel}
            </label>
            <NativeDropdown
              id='ampm-dropdown'
              selectedItemvalue={selectedTime.isPM ? 'PM' : 'AM'}
              selectionItems={ampmOptions}
              className={ClassNames('rbx-select-group time-select-group')}
              onChange={e => {
                const { value } = e.target;
                handleTimeSelection('ampm', value);
              }}
            />
          </div>
        </div>
      </div>
      {errorMessage && (
        <p className='text-error form-control-label modal-error-message'>{errorMessage}</p>
      )}
    </React.Fragment>
  );

  return [selectedMinutes, timeSelector, resetTime, isTimeValid];
};

export default useTimeSelector;
