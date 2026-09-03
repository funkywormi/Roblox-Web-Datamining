import React, { FunctionComponent } from 'react';
import { renderToString } from 'react-dom/server';
import { TranslateFunction } from 'react-utilities';
import {
  TransactionOriginType,
  transactionOriginTypeTranslationKeys,
  PURCHASE_REFUND_TRANSLATION_KEY,
  TransactionItem,
  LicensedPaymentTransactionOriginType,
  licensedPaymentTransactionOriginTypeTranslationKeys
} from '../../../../ts';
import { getAffiliatePayoutTranslationKey } from '../utils/getAffiliatePayoutTranslationKey';
import ItemName from './ItemName';
import FIRST_DAILY_ENGAGEMENT_PAYOUT_DATE from '../constants/dailyEngagementConstants';

interface ItemDescriptionProps {
  item: TransactionItem;
  transactionType: TransactionOriginType | LicensedPaymentTransactionOriginType | null | undefined;
  translate: TranslateFunction;
  created?: string;
}

/**
 * Renders the translated item description for a given item and transaction type. The rendered description
 * may contain a link to the item.
 */
const ItemDescription: FunctionComponent<ItemDescriptionProps> = ({
  item,
  transactionType,
  translate,
  created
}) => {
  if (!transactionType) {
    return null;
  }

  let translationKey = '';
  if (transactionType in licensedPaymentTransactionOriginTypeTranslationKeys) {
    translationKey =
      licensedPaymentTransactionOriginTypeTranslationKeys[
        transactionType as LicensedPaymentTransactionOriginType
      ];
  } else {
    translationKey = transactionOriginTypeTranslationKeys[transactionType as TransactionOriginType];
  }

  if (item?.refunded) {
    translationKey = PURCHASE_REFUND_TRANSLATION_KEY;
  }

  if (transactionType === TransactionOriginType.AffiliatePayout) {
    translationKey = getAffiliatePayoutTranslationKey(item);
  }

  // If the transaction is an engagement payout, we need to check if it is a daily engagement payout or
  // a legacy engagement payout with the first daily engagement payout date.
  if (
    transactionType === TransactionOriginType.EngagementPayout &&
    created &&
    new Date(created) < new Date(FIRST_DAILY_ENGAGEMENT_PAYOUT_DATE)
  ) {
    translationKey = 'Description.PremiumPayout';
  }
  if (
    transactionType === TransactionOriginType.GroupEngagementPayout &&
    created &&
    new Date(created) < new Date(FIRST_DAILY_ENGAGEMENT_PAYOUT_DATE)
  ) {
    translationKey = 'Description.GroupPremiumPayout';
  }

  const itemDescription = translate(translationKey, {
    item: renderToString(<ItemName item={item} />)
  });

  // If this webapp ever gets support for translateHtml this use of dangerouslySetInnerHTML should be replaced.
  return <span dangerouslySetInnerHTML={{ __html: itemDescription }} />;
};

export default ItemDescription;
