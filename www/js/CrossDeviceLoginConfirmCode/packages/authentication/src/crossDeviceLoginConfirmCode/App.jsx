import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslations } from 'react-utilities';
import { translation } from './app.config';
import ConfirmCodeContainer from './container/ConfirmCodeContainer';

function App({ translate }) {
  return (
    <ConfirmCodeContainer translate={translate} />
  );
}

App.propTypes = {
  translate: PropTypes.func.isRequired
};

export default withTranslations(App, translation);
