import React from 'react';
import { useTranslation } from 'react-utilities';
import classNames from 'classnames';

type CycleEndDateProps = {
  expiration: Date;
  renewal: Date;
};

const CycleEndDate: React.FC<CycleEndDateProps> = ({ expiration, renewal }) => {
  const { translate } = useTranslation();

  // Backend returns renewal time ms as 0 if not renewing
  const expiring = renewal.getTime() === 0 || expiration < renewal;

  const subscriptionDisplayDate = (expiring ? expiration : renewal).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const subscriptionDateString = `${
    expiring ? translate('Label.Subscriptions.Expires') : translate('Label.Subscriptions.Renews')
  } ${subscriptionDisplayDate}`;

  return (
    <span
      className={classNames('subscription-date', 'text-description', {
        'text-alert': expiring
      })}>
      {subscriptionDateString}
    </span>
  );
};

export default CycleEndDate;
