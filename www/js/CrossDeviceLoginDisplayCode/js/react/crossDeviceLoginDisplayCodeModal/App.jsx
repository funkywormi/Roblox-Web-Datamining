import React from 'react';
import PropTypes from 'prop-types';
import { withTranslations } from 'react-utilities';
import { translation } from './app.config';
import CrossDeviceLoginDisplayCodeModalContainer from './container/CrossDeviceLoginDisplayCodeModalContainer';

function App({ translate }) {
  return <CrossDeviceLoginDisplayCodeModalContainer translate={translate} />;
}

App.propTypes = {
  translate: PropTypes.func.isRequired
};

export default withTranslations(App, translation);
