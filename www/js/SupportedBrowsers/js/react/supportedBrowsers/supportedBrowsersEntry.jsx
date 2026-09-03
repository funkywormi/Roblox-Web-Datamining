import { ready } from 'core-utilities';
import React from 'react';
import { render } from 'react-dom';
import App from './App';

import '../../../css/supportedBrowsers/supportedBrowser.scss';

ready(() => {
  const webAppContainer =
    document.getElementById('supported-browsers-web-app') ||
    document.getElementById('supported-browsers');
  render(<App />, webAppContainer);
});
