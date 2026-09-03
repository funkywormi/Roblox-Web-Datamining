import React, { FC, useMemo } from 'react';
import classNames from 'classnames';
import { Icon } from '@rbx/foundation-ui';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { groupsConfig } from '../translation.config';

export type CountdownAlertProps = {
  endingDate: Date;
} & WithTranslationsProps;

function getDaysLeft(endingDate: Date, currentDate: Date): number {
  const difference = +endingDate - +currentDate;
  return difference > 0 ? Math.floor(difference / (1000 * 60 * 60 * 24)) : 0;
}

const CountdownAlert: FC<CountdownAlertProps> = ({ endingDate, translate }) => {
  const timeLeft = useMemo(() => {
    const daysLeft = getDaysLeft(endingDate, new Date());

    return daysLeft;
  }, [endingDate]);

  return (
    <div
      className={classNames(
        'select-none countdown-alert padding-small stroke-standard stroke-default flex justify-between items-center radius-small text-label-medium',
        {
          hidden: timeLeft === 0
        }
      )}>
      <Icon name='icon-filled-clock' className='countdown-alert-icon' size='Small' />
      <span className='text-no-wrap text-truncate-end padding-left-xsmall'>
        {timeLeft > 1 && translate('Countdown.TwoOrMoreDaysLeft', { count: timeLeft })}
        {timeLeft === 1 && translate('Countdown.OneDayLeft')}
        {timeLeft === 0 && translate('Countdown.ZeroDaysLeft')}
      </span>
    </div>
  );
};

export default withTranslations(CountdownAlert, groupsConfig);
