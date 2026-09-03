import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-utilities';
import { ProductType } from '@rbx/client-subscriptions-api/v1';
import { Pagination as PaginationBase } from '@rbx/core-ui';
import { ONE_ROBUX_IN_MICROS } from '@rbx/subscriptions-common';
import { PremiumSubscription } from '../../../core/types/premiumSubscription';
import { SubscriptionListItem, UserSubscription } from '../../../core/types/userSubscription';
import SubscriptionCard from './SubscriptionCard';
import { premiumName, premiumPeriod } from '../utils/premiumUtils';
import '../../../../css/subscriptionManagement/subscriptionsList.scss';
import { SubscriptionListItemType } from '../../../core/types/subscriptionEnums';
import PrivateServerCard from './PrivateServerCard';
import { MyPrivateServerType } from '../../../core/types/privateServerTypes';

type SubscriptionsListProps = {
  premiumSubscription: PremiumSubscription | null;
  subscriptionList: SubscriptionListItem[];
  emptyText: string;
  resultsPerPage: number;
  currentPage: number;
  onChangePage: (newPage: number) => void;
  onSelectSubscription?: (
    subscription: UserSubscription | PremiumSubscription,
    isPremium: boolean
  ) => void;
  onSelectPrivateServer?: (privateServer: MyPrivateServerType) => void;
  isPriceLoading?: boolean;
};

const SubscriptionsList: React.FC<SubscriptionsListProps> = ({
  premiumSubscription,
  subscriptionList,
  emptyText,
  resultsPerPage,
  currentPage,
  onChangePage,
  onSelectSubscription,
  onSelectPrivateServer,
  isPriceLoading = false
}) => {
  const { translate } = useTranslation();

  const subscriptionCards = useMemo(() => {
    const resolveSubscriptionName = (sub: UserSubscription): string => {
      switch (sub.productType) {
        case ProductType.Blackbird:
          if (
            sub.currencySubscriptionBenefit &&
            sub.currencySubscriptionBenefit.entitledAmountMicrosPerGrantingPeriod > 0
          ) {
            return `Plus ${sub.currencySubscriptionBenefit.entitledAmountMicrosPerGrantingPeriod / ONE_ROBUX_IN_MICROS}`;
          }
          return translate('Label.Blackbird');
        case ProductType.CurrencySubscription:
          return translate('Label.CurrencySubscription');
        default:
          return sub.name;
      }
    };

    const renderSubscriptionListItem = (
      subscriptionListItem: SubscriptionListItem
    ): React.ReactElement | null => {
      if (subscriptionListItem.type === SubscriptionListItemType.PRIVATE_SERVER) {
        const { privateServer } = subscriptionListItem;
        if (!privateServer) return null;
        return (
          <PrivateServerCard
            key={privateServer.privateServerId}
            privateServer={privateServer}
            isPriceLoading={isPriceLoading}
            onClick={
              onSelectPrivateServer ? () => onSelectPrivateServer(privateServer) : undefined
            }
          />
        );
      }
      const { subscription } = subscriptionListItem;
      if (!subscription) return null;
      return (
        <SubscriptionCard
          key={subscription.subscriptionTargetKey}
          subscriptionName={resolveSubscriptionName(subscription)}
          subscriptionProviderName={subscription.subscriptionProviderName}
          subscriptionPaymentProvider={subscription.paymentProvider}
          iconImageAssetId={subscription.iconImageAssetId}
          productType={subscription.productType}
          price={subscription.price}
          priceInRobux={subscription.priceInRobux}
          purchasePlatform={subscription.purchasePlatform}
          subscriptionPeriod={subscription.subscriptionPeriod}
          periodCount={subscription.periodCount}
          expiration={subscription.expiration}
          renewal={subscription.renewal}
          showLowBalanceNotification={subscription.showLowBalanceNotification}
          subscriptionOffers={subscription.subscriptionOffers}
          onClick={
            onSelectSubscription
              ? () => onSelectSubscription({ ...subscription }, false)
              : undefined
          }
        />
      );
    };

    const isBlackbirdItem = (item: SubscriptionListItem): boolean =>
      item.type === SubscriptionListItemType.SUBSCRIPTION &&
      item.subscription?.productType === ProductType.Blackbird;

    // Render order: Roblox Plus (Blackbird) first, then Premium, then everything else.
    const blackbirdCards = subscriptionList.filter(isBlackbirdItem).map(renderSubscriptionListItem);
    const otherCards = subscriptionList
      .filter(item => !isBlackbirdItem(item))
      .map(renderSubscriptionListItem);

    const premiumCard: React.ReactElement | null = premiumSubscription ? (
      <SubscriptionCard
        key='premium'
        subscriptionName={premiumName(premiumSubscription)}
        subscriptionProviderName={premiumSubscription.subscriptionProviderName}
        price={premiumSubscription.price}
        subscriptionPeriod={premiumPeriod(premiumSubscription)}
        expiration={new Date(premiumSubscription.expiration)}
        renewal={new Date(premiumSubscription.renewal)}
        showLowBalanceNotification={premiumSubscription.showLowBalanceNotification}
        isPremium
        onClick={
          onSelectSubscription ? () => onSelectSubscription(premiumSubscription, true) : undefined
        }
      />
    ) : null;

    return [...blackbirdCards, premiumCard, ...otherCards].filter(
      (el): el is React.ReactElement => el !== null
    );
  }, [
    premiumSubscription,
    subscriptionList,
    onSelectSubscription,
    onSelectPrivateServer,
    isPriceLoading,
    translate
  ]);

  const pageSubscriptionCards = subscriptionCards.slice(
    (currentPage - 1) * resultsPerPage,
    Math.min(currentPage * resultsPerPage, subscriptionCards.length)
  );

  const numPages = Math.ceil(subscriptionCards.length / resultsPerPage);
  const pagination =
    subscriptionCards.length > resultsPerPage ? (
      <div className='overview-pagination-container'>
        <PaginationBase current={currentPage} total={numPages} onChange={onChangePage} hasNext />
      </div>
    ) : null;

  return (
    <div className={classNames({ 'no-active': subscriptionCards.length === 0 })}>
      {subscriptionCards.length > 0 ? (
        <React.Fragment>
          {pageSubscriptionCards}
          {pagination}
        </React.Fragment>
      ) : (
        <span className='text-description'>{emptyText}</span>
      )}
    </div>
  );
};

export default SubscriptionsList;
