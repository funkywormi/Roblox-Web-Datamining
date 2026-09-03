import React from 'react';
import { render } from 'react-dom';
import { ready } from 'core-utilities';
import { adsListRootElementId } from './app.config';
import '../../../css/nativeAdsList/naviteAdsList.scss';
import App from './App';

ready(() => {
  const rootElement =
    document.getElementById('native-ads-list-web-app') ||
    document.getElementById(adsListRootElementId);
  if (rootElement) {
    render(<App />, rootElement);
  }
});
