import './src/main.css';
import React from 'react';
import { render } from 'react-dom';
import { TranslationProvider } from 'react-utilities';
import { authenticatedUser } from 'header-scripts';
import { ready } from 'core-utilities';
import { BrowserRouter } from 'react-router-dom';
import SubscriptionsContainer from '@rbx/subscriptions/ts/react/gameSubscriptions/containers/SubscriptionsContainer';
import '@rbx/subscriptions/css/gameSubscriptions/gameSubscriptions.scss';
import '@rbx/subscriptions/css/tailwind.css';
import { getSubscriptionContainer } from '@rbx/subscriptions/ts/core/constants/browserConstants';
import { experienceSubscriptionTranslationConfig } from '@rbx/subscriptions/ts/react/gameSubscriptions/translation.config';
import SystemFeedbackProvider from '@rbx/subscriptions/ts/react/shared/providers/SystemFeedbackProvider';
import SingleButtonModalProvider from '@rbx/subscriptions/ts/react/shared/providers/SingleButtonModalProvider';
import GameSubscriptionsProvider from '@rbx/subscriptions/ts/react/gameSubscriptions/providers/GameSubscriptionsProvider';

ready(() => {
  // We only want to render subscriptions to authenticated users.
  if (getSubscriptionContainer() && authenticatedUser.isAuthenticated) {
    render(
      <SystemFeedbackProvider>
        <TranslationProvider config={experienceSubscriptionTranslationConfig}>
          <GameSubscriptionsProvider>
            <SingleButtonModalProvider>
              <BrowserRouter>
                <SubscriptionsContainer />
              </BrowserRouter>
            </SingleButtonModalProvider>
          </GameSubscriptionsProvider>
        </TranslationProvider>
      </SystemFeedbackProvider>,
      getSubscriptionContainer()
    );
  }
});
