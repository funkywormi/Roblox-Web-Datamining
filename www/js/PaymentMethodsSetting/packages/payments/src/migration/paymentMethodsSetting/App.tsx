import React from 'react';
import { createSystemFeedback } from 'react-style-guide';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import translationConfig from './app.config';
import SettingContainer from './components/SettingContainer';
import './paymentMethodsSetting.scss';
const App = ({ translate }: WithTranslationsProps) => {
  const [SystemFeedback, systemFeedbackService] = createSystemFeedback();
  return (
    <React.Fragment>
      <SettingContainer translate={translate} systemFeedbackService={systemFeedbackService} />
      <SystemFeedback />
    </React.Fragment>
  );
};

export default withTranslations(App, translationConfig);
