import React from 'react';
import PropTypes from 'prop-types';
import { withTranslations } from 'react-utilities';
import { translation } from './app.config';
import { EconomyMetadataProvider } from './hooks/useEconomyMetadata';
import TransactionsLoader from './containers/TransactionsLoader';

function App({ translate }) {
  return (
    <EconomyMetadataProvider>
      <TransactionsLoader translate={translate} />
    </EconomyMetadataProvider>
  );
}

App.propTypes = {
  translate: PropTypes.func.isRequired
};

export default withTranslations(App, translation);
