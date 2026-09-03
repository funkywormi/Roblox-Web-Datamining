import React from 'react';
import PropTypes from 'prop-types';
import { withTranslations } from 'react-utilities';
import { translation } from './app.config';
import { EconomyMetadataProvider } from './hooks/useEconomyMetadata';
import GroupTransactionsContainer from './containers/GroupTransactionsContainer';

function GroupTransactionsApp({ translate, targetId, transactionType }) {
  return (
    <EconomyMetadataProvider>
      <GroupTransactionsContainer
        translate={translate}
        targetId={targetId}
        transactionType={transactionType}
      />
    </EconomyMetadataProvider>
  );
}

GroupTransactionsApp.propTypes = {
  translate: PropTypes.func.isRequired,
  targetId: PropTypes.string.isRequired,
  transactionType: PropTypes.string.isRequired
};

export default withTranslations(GroupTransactionsApp, translation);
