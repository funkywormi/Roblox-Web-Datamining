import React from 'react';
import { render } from 'react-dom';
import { ready } from 'core-utilities';
import { rootElementId } from './app.config';
import billingTabHash from './constants/robloxCreditConstants';
import App from './App';

import '../../../css/robloxCredit/robloxCredit.scss';

ready(() => {
  const rootElement = document.getElementById(rootElementId);
  if (rootElement) {
    render(<App />, rootElement);
  }

  /* Angular fix to watch for a tab change and re-render language selector if needed
   * This logic will also take care of case when user doesn't land on /#billing first
   */
  window.addEventListener('hashchange', () => {
    if (window.location.hash === billingTabHash) {
      const newRootElement = document.getElementById(rootElementId);
      if (newRootElement) {
        render(<App />, newRootElement);
      }
    }
  });
});
