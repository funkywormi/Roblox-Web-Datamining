import React, { useEffect, useState } from 'react';
import { TranslationProvider, useTheme } from 'react-utilities';
import { BrowserRouter } from 'react-router-dom';
import { UIThemeProvider } from '@rbx/ui';
import translationConfig from './translation.config';
import '../../../css/subscriptionManagement/subscriptionManagement.scss';
import ManagementContainer from './containers/ManagementContainer';
import SystemFeedbackProvider from '../shared/providers/SystemFeedbackProvider';

const App: React.FC = () => {
  const theme = useTheme();

  return (
    <UIThemeProvider theme={theme} cssBaselineMode='disabled'>
      <TranslationProvider config={translationConfig}>
        <SystemFeedbackProvider>
          <BrowserRouter>
            <ManagementContainer />
          </BrowserRouter>
        </SystemFeedbackProvider>
      </TranslationProvider>
    </UIThemeProvider>
  );
};

export default App;
