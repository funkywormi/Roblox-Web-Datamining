import React, { FunctionComponent } from 'react';
import { authenticatedUser } from 'header-scripts';
import { TranslateFunction } from 'react-utilities';
import { Transaction, TransactionOriginType, TransactionSubType } from '../../../../ts';
import getCurrencyTransferDescription from '../utils/currencyTransferDescription';
import getEffectiveTransactionOriginType from '../utils/getEffectiveTransactionOriginType';
import SubscriptionComponent from './SubscriptionComponent';
import LicenseComponent from './LicenseComponent';
import CommissionItemComponent from './CommissionItemComponent';
import CurrencyTransferDescriptionComponent from './CurrencyTransferDescriptionComponent';
import ItemComponent from './ItemComponent';

interface DescriptionCellProps {
  transaction: Transaction;
  translate: TranslateFunction;
}

const DescriptionCell: FunctionComponent<DescriptionCellProps> = ({ transaction, translate }) => {
  if (transaction.transactionSubtype === TransactionSubType.TransferCommission) {
    return <CommissionItemComponent translate={translate} />;
  }

  let RenderDescriptionAsSubscription = false;
  let RenderDescriptionAsLicense = false;

  switch (transaction.transactionType) {
    case TransactionOriginType.SubscriptionsRevsharePayout:
    case TransactionOriginType.GroupSubscriptionsRevsharePayout:
    case TransactionOriginType.SubscriptionsRevshareClawback:
    case TransactionOriginType.GroupSubscriptionsRevshareClawback:
      RenderDescriptionAsSubscription = true;
      break;
    case TransactionOriginType.LicensingPayment:
    case TransactionOriginType.LicensingPaymentClawback:
      RenderDescriptionAsLicense = true;
      break;
    default:
      break;
  }

  if (RenderDescriptionAsSubscription) {
    return <SubscriptionComponent item={transaction.details} translate={translate} />;
  }
  if (RenderDescriptionAsLicense) {
    return <LicenseComponent agreementId={transaction.details.agreementId} translate={translate} />;
  }

  const currencyTransferDescription = getCurrencyTransferDescription(
    transaction,
    authenticatedUser?.id
  );
  if (currencyTransferDescription !== undefined) {
    return (
      <CurrencyTransferDescriptionComponent
        transaction={transaction}
        description={currencyTransferDescription}
        translate={translate}
      />
    );
  }

  return (
    <ItemComponent
      item={transaction.details}
      translate={translate}
      transactionType={getEffectiveTransactionOriginType(transaction)}
      created={transaction.created}
    />
  );
};

export default DescriptionCell;
