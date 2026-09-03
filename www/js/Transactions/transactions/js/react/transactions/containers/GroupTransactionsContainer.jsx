import PropTypes from 'prop-types';
import React, { Fragment, useState } from 'react';
import { createSystemFeedback } from 'react-style-guide';
import { FeedbackBanner } from '@rbx/foundation-ui';

import TransactionsListContainer from './TransactionsListContainer';
import {
  PAGE_SIZES,
  TransactionType,
  AgentType,
  transactionTypeTranslationKeys
} from '../../../../ts';
import TransactionsDownloadComponent from '../components/TransactionsDownloadComponent';
import CreatorHubTransactionsBanner from '../components/CreatorHubTransactionsBanner';
import { useEconomyMetadata } from '../hooks/useEconomyMetadata';
import { getIsTransactionDownloadEnabled } from '../utils/transactionDownload';

const [SystemFeedback, systemFeedbackService] = createSystemFeedback();

function GroupTransactionsContainer({ translate, targetId, transactionType }) {
  const { metadata } = useEconomyMetadata();
  const [hasTransactions, setHasTransactions] = useState(false);
  const [isSalesBannerDismissed, setIsSalesBannerDismissed] = useState(false);

  return (
    <Fragment>
      <div className='group-sales-header-container'>
        <h2 className='group-sales-header'>
          {translate(transactionTypeTranslationKeys[transactionType])}
        </h2>
        {hasTransactions && getIsTransactionDownloadEnabled(transactionType, metadata) && (
          <TransactionsDownloadComponent
            translate={translate}
            targetId={targetId}
            targetType={AgentType.Group}
            systemFeedbackService={systemFeedbackService}
            transactionType={transactionType}
          />
        )}
      </div>
      {metadata?.isCreatorHubTransactionsBannerEnabled &&
        transactionType === TransactionType.Sale && (
          <CreatorHubTransactionsBanner translate={translate} groupId={targetId} />
        )}
      {transactionType === TransactionType.Sale && !isSalesBannerDismissed && (
        <div style={{ margin: '16px 0' }}>
          <FeedbackBanner
            title={translate('Message.SalesRefundInfo')}
            severity='Info'
            variant='Emphasis'
            layout='Stacked'
            onDismiss={() => setIsSalesBannerDismissed(true)}
          />
        </div>
      )}
      {metadata && (
        <TransactionsListContainer
          translate={translate}
          targetId={targetId}
          targetType={AgentType.Group}
          transactionType={transactionType}
          pageSize={PAGE_SIZES[0]}
          setHasTransactions={setHasTransactions}
        />
      )}
      <SystemFeedback />
    </Fragment>
  );
}

GroupTransactionsContainer.propTypes = {
  translate: PropTypes.func.isRequired,
  targetId: PropTypes.string.isRequired,
  transactionType: PropTypes.string.isRequired
};

export default GroupTransactionsContainer;
