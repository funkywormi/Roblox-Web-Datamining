import classNames from 'classnames';
import PropTypes from 'prop-types';
import { CursorPager } from 'core-utilities';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Pagination, Loading } from 'react-style-guide';
import { getTransactionHistory } from '../services/transactionsDataService';
import {
  getSubscriptionProductKey,
  fetchSubscriptionProductInfo
} from '../services/subscriptionsDataService';
import TransactionsTable from '../components/TransactionsTable';
import { LOAD_PAGE_SIZE, TransactionType } from '../../../../ts';

function TransactionsContainer({
  translate,
  targetId,
  targetType,
  transactionType,
  itemPricingType,
  pageSize,
  setHasTransactions,
  className,
  isLegalTextDisplayed,
  isFiatPaidAccessEnabled
}) {
  // State hooks
  const [transactionPage, setTransactionPage] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);

  /**
   * Use subscriptions-api to fetch the name and image asset id for each
   * subscription product in the set of transactionItems.
   */
  const loadSubscriptionProducts = useCallback(async transactionItems => {
    const uniqueSubscriptionsMap = await fetchSubscriptionProductInfo(transactionItems);
    transactionItems.forEach(txn => {
      const detailsMap = txn.details;
      const subscriptionProductKey = getSubscriptionProductKey(
        txn.details.subscriptionProductTargetId,
        txn.details.subscriptionProductTargetType
      );
      const subscriptionProduct = uniqueSubscriptionsMap[subscriptionProductKey];
      detailsMap.iconImageAssetId =
        subscriptionProduct.data.subscriptionProductInfo.iconImageAssetId;
      detailsMap.name = subscriptionProduct.data.subscriptionProductInfo.name;
    });
  }, []);

  // Pagination
  const pagerRef = useRef(null);

  const loadPage = useCallback(
    async pageLoaderCallback => {
      try {
        await pageLoaderCallback();
      } catch (error) {
        setTransactionPage([]);
        if (error?.data?.length > 0 && error.data[0].userFacingMessage) {
          setErrorMessage(error.data[0].userFacingMessage);
        } else {
          setErrorMessage(translate('Message.UnknownError'));
        }
      }
    },
    [translate]
  );

  const handlePagination = async pageNumber => {
    loadPage(async () => {
      setLoading(true);
      const pager = pagerRef.current;
      let transactionItems = [];
      if (pageNumber < pager.currentPageNumber) {
        transactionItems = await pager.loadPreviousPage();
      } else if (pageNumber > pager.currentPageNumber) {
        transactionItems = await pager.loadNextPage();
      }
      if (
        transactionType === TransactionType.SubscriptionsRevsharePayout ||
        transactionType === TransactionType.GroupSubscriptionsRevsharePayout
      ) {
        await loadSubscriptionProducts(transactionItems);
      }
      setTransactionPage(transactionItems);
      setLoading(false);
    });
  };

  useEffect(() => {
    pagerRef.current = new CursorPager(pageSize, LOAD_PAGE_SIZE, getTransactionHistory);
    let shouldUpdate = true;
    const loadFirstPage = async () => {
      loadPage(async () => {
        setLoading(true);
        const pager = pagerRef.current;
        const transactionItems = await pager.setPagingParametersAndLoadFirstPage({
          targetId,
          targetType,
          transactionType,
          itemPricingType,
          isFiatPaidAccessEnabled
        });
        if (
          transactionType === TransactionType.SubscriptionsRevsharePayout ||
          transactionType === TransactionType.GroupSubscriptionsRevsharePayout
        ) {
          await loadSubscriptionProducts(transactionItems);
        }
        if (shouldUpdate) {
          setTransactionPage(transactionItems);
          setHasTransactions(transactionItems?.length > 0);
          setLoading(false);
        }
      });
    };

    loadFirstPage();

    // Disregard results of in progress updates if we switch to a new transaction type or page size
    return () => {
      shouldUpdate = false;
    };
  }, [
    transactionType,
    itemPricingType,
    pageSize,
    loadPage,
    targetId,
    targetType,
    setHasTransactions,
    loadSubscriptionProducts
  ]);

  if (transactionPage == null) return <Loading />;

  return (
    <div className={className}>
      {transactionPage.length === 0 && !isLoading ? (
        <div className='section-content-off'>
          {errorMessage || translate('Message.NoTransactions')}
        </div>
      ) : (
        <div className={classNames('transactions-container', { faded: isLoading })}>
          <TransactionsTable
            translate={translate}
            targetType={targetType}
            transactions={transactionPage}
          />
          <Pagination
            current={pagerRef.current.currentPageNumber}
            hasNext={pagerRef.current.hasNextPage}
            onChange={handlePagination}
          />
          {isLegalTextDisplayed &&
            (transactionType === TransactionType.PremiumStipend ||
              transactionType === TransactionType.CurrencyPurchase) && (
              <span className='text-footer legal-text-holder'>
                {translate('Description.LegalText')}
              </span>
            )}
        </div>
      )}
    </div>
  );
}

TransactionsContainer.propTypes = {
  translate: PropTypes.func.isRequired,
  targetId: PropTypes.number.isRequired,
  targetType: PropTypes.string.isRequired,
  transactionType: PropTypes.string.isRequired,
  itemPricingType: PropTypes.string.isRequired,
  pageSize: PropTypes.number.isRequired,
  setHasTransactions: PropTypes.func,
  className: PropTypes.string,
  isLegalTextDisplayed: PropTypes.bool,
  isFiatPaidAccessEnabled: PropTypes.bool
};

TransactionsContainer.defaultProps = {
  setHasTransactions: hasTransactions => {},
  className: '',
  isLegalTextDisplayed: false,
  isFiatPaidAccessEnabled: false
};

export default TransactionsContainer;
