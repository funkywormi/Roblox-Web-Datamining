import React from 'react';
import PropTypes from 'prop-types';
import { withTranslations } from 'react-utilities';
import { translation } from './app.config';
import AccountRecoveryModalContainer from './container/AccountRecoveryModalContainer';

function App({ translate }) {
  return <AccountRecoveryModalContainer translate={translate} />;
}

App.propTypes = {
  translate: PropTypes.func.isRequired
};

export default withTranslations(App, translation);
