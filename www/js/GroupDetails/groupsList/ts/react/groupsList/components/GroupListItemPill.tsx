import React from 'react';
import classNames from 'classnames';

const GroupListItemPill = ({
  label,
  flavor,
  noTruncate
}: {
  label: string;
  flavor: string;
  noTruncate?: boolean;
}): JSX.Element => {
  return (
    <span
      className={classNames(
        'groups-list-item-pill block radius-circle text-caption-medium padding-x-small padding-y-xxsmall',
        noTruncate ? 'shrink-0' : 'shrink-1',
        `flavor-${flavor}`
      )}>
      {label}
    </span>
  );
};

export default GroupListItemPill;
