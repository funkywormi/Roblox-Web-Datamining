import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { Intl } from 'Roblox';

function DateComponent({ date, small }) {
  const smallScreenDateDivider = ' | ';

  const intl = new Intl();
  const dateTimeFormatter = intl.getDateTimeFormatter();
  const dateTime = dateTimeFormatter.getCustomDateTime(date, {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit'
  });
  const hourTime = dateTimeFormatter.getCustomDateTime(date, {
    hour: 'numeric',
    minute: 'numeric'
  });

  return small ? (
    <Fragment>
      <span>{dateTime}</span>
      <span>{smallScreenDateDivider}</span>
      <span>{hourTime}</span>
    </Fragment>
  ) : (
    <Fragment>
      <div>{dateTime}</div>
      <div>{hourTime}</div>
    </Fragment>
  );
}

DateComponent.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  small: PropTypes.bool
};
DateComponent.defaultProps = {
  small: false
};

export default DateComponent;
