import React from 'react';
import { renderToString } from 'react-dom/server';
import PriceLabel from './PriceLabel';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import { getMetaData } from '../util/itemPurchaseUtil';
import { SelfProvidedTranslate } from '../SelfProvidedTranslate';
import { purchasingNamespaces, usePurchasingTranslate, type PurchaseTranslate } from '../useTranslate';

const { resources } = itemPurchaseConstants;

interface BalanceAfterSaleTextProps {
  translate?: PurchaseTranslate;
  expectedPrice: number;
  currentRobuxBalance?: number;
}

function BalanceAfterSaleText({
  translate,
  expectedPrice,
  currentRobuxBalance
}: BalanceAfterSaleTextProps & { translate: PurchaseTranslate }) {
  const currentBalance = currentRobuxBalance ?? getMetaData().userRobuxBalance ?? 0;
  const balanceAfterSale = currentBalance - expectedPrice;
  if (!currentRobuxBalance) {
    return <span />;
  }
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: translate(resources.balanceAfterMessage, {
          robuxBalance: renderToString(
            <PriceLabel {...{ price: balanceAfterSale, color: 'gray', useFreeText: false }} />
          )
        })
      }}
    />
  );
}

export default function BalanceAfterSaleTextWithTranslations({
  translate,
  ...props
}: BalanceAfterSaleTextProps) {
  return (
    <SelfProvidedTranslate
      translate={translate}
      namespaces={purchasingNamespaces}
      useTranslate={usePurchasingTranslate}
      render={t => <BalanceAfterSaleText {...props} translate={t} />}
    />
  );
}
