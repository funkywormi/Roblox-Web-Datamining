import React, { FunctionComponent } from 'react';
import { TranslateFunction } from 'react-utilities';
import { authenticatedUser } from 'header-scripts';
import MemberComponent from './MemberComponent';
import RobloxSourceComponent from './RobloxSourceComponent';
import UniverseComponent from './UniverseComponent';
import { Transaction, TransactionOriginType, AgentType } from '../../../../ts';
import getCurrencyTransferDescription, {
  getCurrencyTransferHeadshotTargetId
} from '../utils/currencyTransferDescription';

interface SourceCellProps {
  transaction: Transaction;
  translate: TranslateFunction;
}

const SourceCell: FunctionComponent<SourceCellProps> = ({ transaction, translate }) => {
  const licensingPaymentTransactionOriginType =
    transaction?.details?.licensingPaymentTransactionOriginType;
  const item = transaction?.details;
  let RenderSourceAsUniverse = false;
  let RenderSourceAsRoblox = false;

  switch (transaction.transactionType) {
    case TransactionOriginType.SubscriptionsRevsharePayout:
    case TransactionOriginType.GroupSubscriptionsRevsharePayout:
    case TransactionOriginType.LicensingPayment:
      RenderSourceAsUniverse = true;
      break;
    case TransactionOriginType.SubscriptionsRevshareClawback:
    case TransactionOriginType.GroupSubscriptionsRevshareClawback:
    case TransactionOriginType.LicensingPaymentClawback:
      RenderSourceAsRoblox = true;
      break;
    default:
      break;
  }

  if (RenderSourceAsUniverse) {
    return (
      <UniverseComponent
        item={item}
        licensingPaymentTransactionOriginType={licensingPaymentTransactionOriginType}
        translate={translate}
      />
    );
  }
  if (RenderSourceAsRoblox) {
    return (
      <RobloxSourceComponent
        item={item}
        transactionOriginType={transaction.transactionType}
        translate={translate}
      />
    );
  }

  if (transaction.transactionType === TransactionOriginType.CurrencyTransfer) {
    const desc = getCurrencyTransferDescription(transaction, authenticatedUser?.id);
    if (desc) {
      let senderId: number | null;
      let senderName: string;

      if (desc.kind === 'received') {
        // Sender is the other party — show their headshot and name.
        senderId = getCurrencyTransferHeadshotTargetId(transaction, 'received');
        senderName = desc.counterPartyName ?? '';
      } else {
        // sent / unableToSend — current user is the sender.
        senderId = authenticatedUser?.id ?? null;
        senderName = authenticatedUser?.name ?? '';
      }

      if (senderId !== null) {
        return (
          <MemberComponent member={{ id: senderId, type: AgentType.User, name: senderName }} />
        );
      }
    }
  }

  return <MemberComponent member={transaction.agent} />;
};

export default SourceCell;
