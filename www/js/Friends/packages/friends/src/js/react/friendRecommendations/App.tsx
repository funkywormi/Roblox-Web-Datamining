import PropTypes from 'prop-types';
import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import translationConfig from './translation.config';
import FriendRecommendations from './components/FriendRecommendations';

function App({ translate }: WithTranslationsProps) {
  return <FriendRecommendations translate={translate} />;
}

App.propTypes = {
  translate: PropTypes.func.isRequired
};

export default withTranslations(App, translationConfig);
