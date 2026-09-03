import { authenticatedUser } from 'header-scripts';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { createSystemFeedback, Dropdown, Link } from 'react-style-guide';
import { Intl } from 'Roblox';
import { FeedbackBanner } from '@rbx/foundation-ui';
import {
  getUsedTransactionTypeFlags,
  getCurrency,
  getHasFiatPaidAccessPurchase
} from '../services/transactionsDataService';
import {
  getUsedTransactionTypes,
  generateBitwiseFlagFromUsedTypes
} from '../utils/transactionTypeHelper';
import { getBuyRobuxUrl } from '../utils/urlHelper';
import SummaryContainer from './SummaryContainer';
import TransactionsListContainer from './TransactionsListContainer';
import {
  sendTransactionTypeClickEvent,
  sendTimeFrameClickEvent,
  sendRobuxPageClickEvent
} from '../utils/events';
import {
  timeFrameTranslationKeys,
  transactionTypeTranslationKeys,
  AgentType,
  SummaryTimeFrame,
  TransactionType,
  urlService,
  PAGE_SIZES
} from '../../../../ts';
import TransactionsDownloadComponent from '../components/TransactionsDownloadComponent';
import PaidItemSelectionDropdown from '../components/PaidItemDropdownComponent';
import { getIsTransactionDownloadEnabled } from '../utils/transactionDownload';
import universalAppConfigurationService from '../services/universalAppConfigurationService';
import CreatorHubTransactionsBanner from '../components/CreatorHubTransactionsBanner';

const [SystemFeedback, systemFeedbackService] = createSystemFeedback();
const PRICING_TYPE_PAID_AND_LIMITED = 'PaidAndLimited';
function TransactionsContainer({ translate, metadata }) {
  // Constants
  const { name, displayName, id: userId } = authenticatedUser;
  const intl = new Intl();

  const warningEmoji = '⚠️';
  const DELAY_MSG_FALLBACK =
    "We're currently experiencing higher than usual traffic, which may temporarily delay the display of your transaction data. Please refresh the page later to see the latest details.";

  // Dropdowns
  const [transactionType, setTransactionType] = useState(TransactionType.Summary);
  const [timeFrame, setTimeFrame] = useState(SummaryTimeFrame.Month);
  const [transactionTypeOptions, setTransactionTypeOptions] = useState({});
  const [usedTypes, setUsedTypes] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [itemPricingType, setItemPricingType] = useState(PRICING_TYPE_PAID_AND_LIMITED);

  // Robux balance
  const [robuxBalance, setRobuxBalance] = useState(null);

  // Sales feedback banner
  const [isSalesBannerDismissed, setIsSalesBannerDismissed] = useState(false);

  // Strings
  const userCurrency = `${translate('Heading.MyBalance')}: `;

  // Legal text
  const [isLegalTextDisplayed, setIsLegalTextDisplayed] = useState(false);

  const handleTransactionTypeSelect = selection => {
    setTransactionType(selection);
  };

  const handleTimeFrameSelect = selection => {
    setTimeFrame(selection);
  };

  useEffect(() => {
    universalAppConfigurationService
      .getLegalTextDisplayedBehavior()
      .then(response => {
        setIsLegalTextDisplayed(response.displayEEAUKLegalText);
      })
      .catch(() => {
        setIsLegalTextDisplayed(false);
      });

    getUsedTransactionTypeFlags(userId).then(response => {
      const usedTransactionTypeFlags = response.data;
      getHasFiatPaidAccessPurchase().then(hasFiatPaidAccessPurchase => {
        usedTransactionTypeFlags.HasPurchase =
          usedTransactionTypeFlags.HasPurchase || hasFiatPaidAccessPurchase;
        setTransactionTypeOptions(getUsedTransactionTypes(usedTransactionTypeFlags, false, false));
        const usedTypesBitwiseFlag = generateBitwiseFlagFromUsedTypes(
          getUsedTransactionTypes(usedTransactionTypeFlags, true)
        );
        setUsedTypes(usedTypesBitwiseFlag);
      });
    });

    getCurrency(userId).then(
      response => {
        setRobuxBalance(response.data?.robux);
      },
      errors => {
        if (errors.length >= 0 && errors[0].code) {
          const errorCode = errors[0].code;
          systemFeedbackService.warning(`Error Code: ${errorCode}`);
        }
      }
    );
  }, [userId]);

  return (
    <div className='user-transactions-container'>
      {metadata?.isMyTransactionsDelayBannerEnabled && (
        <div className='transaction-delay-alert-container'>
          <div className='transaction-delay-alert-box'>
            <span className='transaction-delay-alert-icon'>{warningEmoji}</span>
            <h5 className='transaction-delay-alert-text'>
              {translate('Message.TransactionDelay') || DELAY_MSG_FALLBACK}
            </h5>
          </div>
        </div>
      )}
      {metadata?.isTrsQueryWindowLimitBannerEnabled && (
        <div className='transaction-delay-alert-container'>
          <div className='transaction-delay-alert-box'>
            <span className='transaction-delay-alert-icon'>{warningEmoji}</span>
            <h5 className='transaction-delay-alert-text'>
              {translate('Message.TransactionQueryWindowLimit')}
            </h5>
          </div>
        </div>
      )}
      <div className='container-header'>
        <h1>{translate('Heading.Title')}</h1>
        <h2 className='transactions-title-with-input'>
          <a href={urlService.getAgentProfileUrl({ type: AgentType.User, id: userId, name })}>
            {displayName}
          </a>
          <div className='balance-label icon-robux-container'>
            {robuxBalance === null ? (
              <div className='shimmer-lines'>
                <span className='shimmer-line' />
              </div>
            ) : (
              <span>
                {userCurrency}
                <span className='icon-robux-16x16' />
                {intl.n(robuxBalance)}
              </span>
            )}
            <Link
              url={getBuyRobuxUrl()}
              onClick={sendRobuxPageClickEvent}
              className='btn-growth-md btn-more'>
              {translate('Action.BuyRobux')}
            </Link>
          </div>
        </h2>
      </div>
      {metadata?.isCreatorHubTransactionsBannerEnabled &&
        transactionType === TransactionType.Sale && (
          <CreatorHubTransactionsBanner translate={translate} userId={userId} />
        )}
      <div className='dropdown-container container-header'>
        <div className='transaction-type-dropdown dropdown-btn'>
          <label
            id='type-selection-label'
            htmlFor='type-selection'
            className='font-caption-header text'>
            {translate('Label.TransactionType') || 'Type of Transaction'}
          </label>
          <Dropdown
            id='type-selection'
            labelledby='type-selection-label'
            currSelectionLabel={translate(transactionTypeTranslationKeys[transactionType])}>
            {Object.keys(transactionTypeOptions)
              .filter(
                transactionTypeOption =>
                  transactionTypeOption !== TransactionType.PendingRobux &&
                  (transactionTypeOption !== TransactionType.PublishingAdvanceRebates ||
                    metadata?.isPublishingAdvanceRebatePageEnabled)
              )
              .map(transactionTypeOption => {
                return (
                  <Dropdown.Item
                    key={transactionTypeOption}
                    onClick={() => {
                      handleTransactionTypeSelect(transactionTypeOption);
                      sendTransactionTypeClickEvent(transactionTypeOption);
                    }}
                    active={transactionType === transactionTypeOption}>
                    {translate(transactionTypeTranslationKeys[transactionTypeOption])}
                  </Dropdown.Item>
                );
              })}
          </Dropdown>
        </div>
        {transactionType === TransactionType.Summary ? (
          <div className='transaction-date-dropdown dropdown-btn'>
            <label
              id='date-selection-label'
              htmlFor='date-selection'
              className='font-caption-header text'>
              {translate('Label.DateRange') || 'Date Range'}
            </label>
            <Dropdown
              currSelectionLabel={translate(timeFrameTranslationKeys[timeFrame])}
              id='date-selection'>
              {Object.keys(SummaryTimeFrame).map(timeFrameOption => {
                return (
                  <Dropdown.Item
                    key={timeFrameOption}
                    onClick={() => {
                      handleTimeFrameSelect(timeFrameOption);
                      sendTimeFrameClickEvent(timeFrameOption);
                    }}
                    active={timeFrame === timeFrameOption}>
                    {translate(timeFrameTranslationKeys[timeFrameOption])}
                  </Dropdown.Item>
                );
              })}
            </Dropdown>
          </div>
        ) : (
          <div className='transaction-num-items-dropdown dropdown-btn'>
            <label
              id='num-items-selection-label'
              htmlFor='num-items-selection'
              className='font-caption-header text'>
              {translate('Label.NumberOfItems') || 'Number of Items'}
            </label>
            <Dropdown
              currSelectionLabel={translate('Label.PageSize', { numPages: pageSize })}
              id='num-items-selection'>
              {PAGE_SIZES.map(numItems => {
                return (
                  <Dropdown.Item
                    key={numItems}
                    onClick={() => {
                      setPageSize(numItems);
                    }}
                    active={pageSize === numItems}>
                    {translate('Label.PageSize', { numPages: numItems })}
                  </Dropdown.Item>
                );
              })}
            </Dropdown>
          </div>
        )}
        {transactionType === TransactionType.Purchase && (
          <PaidItemSelectionDropdown
            itemPricingType={itemPricingType}
            setItemPricingType={setItemPricingType}
            translate={translate}
            isFiatPaidAccessEnabled
          />
        )}
        {getIsTransactionDownloadEnabled(transactionType, metadata) && (
          <TransactionsDownloadComponent
            translate={translate}
            targetId={userId}
            targetType={AgentType.User}
            systemFeedbackService={systemFeedbackService}
            transactionType={transactionType}
          />
        )}
      </div>
      {transactionType === TransactionType.Sale && !isSalesBannerDismissed && (
        <div style={{ margin: '12px 0' }}>
          <FeedbackBanner
            title={translate('Message.SalesRefundInfo')}
            severity='Info'
            variant='Emphasis'
            layout='Stacked'
            onDismiss={() => setIsSalesBannerDismissed(true)}
          />
        </div>
      )}
      {transactionType === TransactionType.Summary ? (
        <SummaryContainer
          translate={translate}
          systemFeedbackService={systemFeedbackService}
          userId={userId}
          transactionTypeOptions={transactionTypeOptions}
          usedTypes={usedTypes}
          timeFrame={timeFrame}
          onTransactionTypeSelect={handleTransactionTypeSelect}
        />
      ) : (
        <TransactionsListContainer
          translate={translate}
          targetId={userId}
          targetType={AgentType.User}
          transactionType={transactionType}
          pageSize={pageSize}
          itemPricingType={itemPricingType}
          className='section'
          isLegalTextDisplayed={isLegalTextDisplayed}
          isFiatPaidAccessEnabled
        />
      )}
      <SystemFeedback />
    </div>
  );
}

TransactionsContainer.propTypes = {
  translate: PropTypes.func.isRequired,
  metadata: PropTypes.shape({
    isMyTransactionsDelayBannerEnabled: PropTypes.bool,
    isPublishingAdvanceRebatePageEnabled: PropTypes.bool,
    isTrsQueryWindowLimitBannerEnabled: PropTypes.bool,
    isCreatorHubTransactionsBannerEnabled: PropTypes.bool
  })
};

TransactionsContainer.defaultProps = {
  metadata: {}
};

export default TransactionsContainer;
