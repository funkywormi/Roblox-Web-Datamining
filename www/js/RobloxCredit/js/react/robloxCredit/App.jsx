import React from 'react';
import PropTypes from 'prop-types';
import { withTranslations } from 'react-utilities';
import { translation } from './app.config';
import RobloxCreditBase from './containers/RobloxCreditBase';

function App({ translate }) {
  return <RobloxCreditBase translate={translate} />;
}

App.propTypes = {
  translate: PropTypes.func.isRequired
};

export default withTranslations(App, translation);
