import PropTypes from 'prop-types';
import React from 'react';
import { useEconomyMetadata } from '../hooks/useEconomyMetadata';
import TransactionsContainer from './TransactionsContainer';

const warningEmoji = '⚠️';

/**
 * This component is a shim to conditionally render the TransactionsContainer if economy metadata
 * says to. If an error occurs, TransactionsContainer will still render, in keeping
 * with its behavior before this shim. During load, a spinner is displayed.
 */
function TransactionsLoader({ translate }) {
  const { metadata, status } = useEconomyMetadata();

  if (status === 'initializing' || status === 'loading') {
    return (
      <div className='user-transactions-container'>
        <div className='container-header'>
          <h1>{translate('Heading.Title')}</h1>
        </div>
        <div className='spinner spinner-default' />
      </div>
    );
  }

  if (status === 'success' && metadata?.isMyTransactionsPageDisabled) {
    return (
      <div className='user-transactions-container'>
        <div className='container-header'>
          <h1>{translate('Heading.Title')}</h1>
        </div>
        <div className='transaction-delay-alert-container'>
          <div className='transaction-delay-alert-box'>
            <span className='transaction-delay-alert-icon'>{warningEmoji}</span>
            <h5 className='transaction-delay-alert-text'>
              {translate('Message.MyTransactionsPageDisabled')}
            </h5>
          </div>
        </div>
      </div>
    );
  }

  return <TransactionsContainer translate={translate} metadata={metadata} />;
}

TransactionsLoader.propTypes = {
  translate: PropTypes.func.isRequired,
  metadata: PropTypes.shape({
    isMyTransactionsPageDisabled: PropTypes.bool
  })
};

TransactionsLoader.defaultProps = {
  metadata: {}
};

export default TransactionsLoader;
