/* eslint-disable @typescript-eslint/no-shadow */
import React, { useMemo } from 'react';
import { useTranslation } from 'react-utilities';
import classNames from 'classnames';
import { Dropdown, Menu, MenuSection, MenuItem, TMenuItemProps } from '@rbx/foundation-ui';
import {
  maxSignUpAge,
  minSignUpAge,
  monthStrings,
  signupFormStrings
} from '../../constants/signupConstants';
import { Birthday } from '../signUpState';
import { intl } from '../utils';
import { daysInMonthYear } from '../utils/date';

const dayList = (year?: number, month?: number, day?: number) => {
  const numberOfDays = month == null ? 31 : daysInMonthYear(month, year);
  const days: TMenuItemProps[] = Array.from({ length: numberOfDays }, (_, i) => {
    const value = (i + 1).toString();
    const title = value.padStart(2, '0');
    return { value, title };
  });
  // If the currently selected day is invalid, we need to still include it in the list to prevent
  // the UI from breaking. Instead, we just mark it as disabled.
  if (day != null && day > numberOfDays) {
    const value = day.toString();
    const title = value.padStart(2, '0');
    days.push({ value, title, disabled: true });
  }
  return days;
};

const monthList = monthStrings.map((title, i) => ({ value: i.toString(), title }));

const yearList = (() => {
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear - minSignUpAge;
  return Array.from({ length: maxSignUpAge - minSignUpAge }, (_, i) => {
    const value = (maxYear - i).toString();
    return { value, title: value };
  });
})();

const datePartOrder = intl.getDateTimeFormatter().getOrderedDateParts();

export type BirthdayInputProps = {
  birthday: Birthday;
  hasError?: boolean;
  error?: string;
  isDisabled?: boolean;
  onChangeYear: (year: number) => void;
  onChangeMonth: (month: number) => void;
  onChangeDay: (day: number) => void;
  onOpenChangeYear?: (open: boolean) => void;
  onOpenChangeMonth?: (open: boolean) => void;
  onOpenChangeDay?: (open: boolean) => void;
};

const DatePartDropdown = ({
  value,
  label,
  list,
  hasError,
  isDisabled,
  onChange,
  onOpenChange
}: {
  value?: number;
  label: string;
  list: TMenuItemProps[];
  hasError?: boolean;
  isDisabled?: boolean;
  onChange: (value: number) => void;
  onOpenChange?: (open: boolean) => void;
}) => (
  <Dropdown
    size='Medium'
    value={value?.toString() ?? ''}
    placeholder={label}
    ariaLabel={label}
    hasError={hasError}
    isDisabled={isDisabled}
    onValueChange={v => onChange(parseInt(v, 10))}
    onOpenChange={onOpenChange}>
    <Menu>
      <MenuSection>
        {list.map(props => (
          <MenuItem key={props.value} {...props} />
        ))}
      </MenuSection>
    </Menu>
  </Dropdown>
);

const BirthdayInput = ({
  birthday,
  hasError,
  error,
  isDisabled,
  onChangeYear,
  onChangeMonth,
  onChangeDay,
  onOpenChangeYear,
  onOpenChangeMonth,
  onOpenChangeDay
}: BirthdayInputProps): JSX.Element => {
  const { year, month, day } = birthday;
  const isError = hasError === true || error != null;
  const { translate } = useTranslation();

  const yearDropdown = useMemo(
    () => (
      <DatePartDropdown
        value={year}
        label={translate(signupFormStrings.Year)}
        list={yearList}
        hasError={isError}
        isDisabled={isDisabled}
        onChange={onChangeYear}
        onOpenChange={onOpenChangeYear}
      />
    ),
    [translate, year, isError, isDisabled, onChangeYear, onOpenChangeYear]
  );
  const monthDropdown = useMemo(
    () => (
      <DatePartDropdown
        value={month}
        label={translate(signupFormStrings.Month)}
        list={monthList.map(({ value, title }) => ({ value, title: translate(title) }))}
        hasError={isError}
        isDisabled={isDisabled}
        onChange={onChangeMonth}
        onOpenChange={onOpenChangeMonth}
      />
    ),
    [translate, month, isError, isDisabled, onChangeMonth, onOpenChangeMonth]
  );
  const dayDropdown = (
    <DatePartDropdown
      value={day}
      label={translate(signupFormStrings.Day)}
      list={dayList(year, month, day)}
      hasError={isError}
      isDisabled={isDisabled}
      onChange={onChangeDay}
      onOpenChange={onOpenChangeDay}
    />
  );

  const parts = [
    ['day', dayDropdown] as const,
    ['month', monthDropdown] as const,
    ['year', yearDropdown] as const
  ].sort(([a], [b]) => datePartOrder[a] - datePartOrder[b]);

  const labelId = 'signup-birthday-label';
  return (
    <div role='group' aria-labelledby={labelId} className='flex flex-col gap-small'>
      <span
        id={labelId}
        className={classNames('text-title-medium content-emphasis', isDisabled && 'opacity-[0.5]')}>
        {/* translate(isVPCSignup ? signupFormStrings.BirthdayRequired : signupFormStrings.Birthday) */}
        {translate(signupFormStrings.Birthday)}
      </span>
      <div className='grid gap-small' style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {parts.map(([key, part]) => (
          <React.Fragment key={key}>{part}</React.Fragment>
        ))}
      </div>
      {error == null ? (
        <span className='height-350' />
      ) : (
        <span className='text-caption-small content-system-alert'>{error}</span>
      )}
    </div>
  );
};

export default BirthdayInput;
