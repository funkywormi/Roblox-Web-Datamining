import React from 'react';
import PropTypes from 'prop-types';
import { withTranslations } from 'react-utilities';
import { translationConfig } from './translation.config';
import SupportedBrowsersContainer from './components/SupportedBrowsersContainer';

function App({ translate }) {
  return <SupportedBrowsersContainer translate={translate} />;
}

App.propTypes = {
  translate: PropTypes.func.isRequired
};
export default withTranslations(App, translationConfig);
