import React, { FunctionComponent } from 'react';
import { renderToString } from 'react-dom/server';
import { TranslateFunction } from 'react-utilities';
import {
  TransactionOriginType,
  transactionOriginTypeTranslationKeys,
  PURCHASE_REFUND_TRANSLATION_KEY,
  TransactionItem,
  LicensedPaymentTransactionOriginType,
  licensedPaymentTransactionOriginTypeTranslationKeys,
  TransactionSubType,
  Agent
} from '../../../../ts';
import { getAffiliatePayoutTranslationKey } from '../utils/getAffiliatePayoutTranslationKey';
import getGiftTranslationKey from '../utils/getGiftTranslationKey';
import translateGiftDescription from '../utils/translateGiftDescription';
import ItemName from './ItemName';
import RecipientName from './RecipientName';
import FIRST_DAILY_ENGAGEMENT_PAYOUT_DATE from '../constants/dailyEngagementConstants';

interface ItemDescriptionProps {
  item: TransactionItem;
  transactionType: TransactionOriginType | LicensedPaymentTransactionOriginType | null | undefined;
  translate: TranslateFunction;
  created?: string;
  transactionSubtype?: TransactionSubType | null;
  recipient?: Agent | null;
}

/**
 * Renders the translated item description for a given item and transaction type. The rendered description
 * may contain a link to the item.
 */
const ItemDescription: FunctionComponent<ItemDescriptionProps> = ({
  item,
  transactionType,
  translate,
  created,
  transactionSubtype,
  recipient
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

  const renderedItemName = renderToString(<ItemName item={item} />);

  // Gift wording last, so it overrides the origin-type default -- a receipt arrives as a Purchase
  // and would otherwise read "Purchased {item}". A refund still wins: it is applied above and a
  // refunded gift is no longer a gift the viewer holds.
  const giftTranslationKey = item?.refunded
    ? null
    : getGiftTranslationKey(
        transactionSubtype,
        transactionType as TransactionOriginType,
        !!recipient?.name
      );

  // Rendered the same way as the item name, through renderToString, so the recipient is a link to
  // their profile and the name is escaped on the way in -- the result is injected with
  // dangerouslySetInnerHTML below.
  const renderedRecipientName = recipient?.name
    ? renderToString(<RecipientName recipient={recipient} />)
    : '';

  // Empty means the gift key resolved to neither a translation nor a fallback. Every gift key has
  // a fallback today, so this is a safety net rather than a path in use: it keeps the row's
  // existing wording instead of rendering a bare item name if a key is ever added without one.
  const giftDescription = giftTranslationKey
    ? translateGiftDescription(translate, giftTranslationKey, {
        item: renderedItemName,
        recipient: renderedRecipientName
      })
    : '';

  const itemDescription =
    giftDescription ||
    translate(translationKey, {
      item: renderedItemName
    });

  // If this webapp ever gets support for translateHtml this use of dangerouslySetInnerHTML should be replaced.
  return <span dangerouslySetInnerHTML={{ __html: itemDescription }} />;
};

export default ItemDescription;
