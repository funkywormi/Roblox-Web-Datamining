import { ready } from 'core-utilities';
import React from 'react';
import { render } from 'react-dom';
import Roblox from 'Roblox';
import '../../../css/captchaV2Bundle.scss';
import App from './App';
import rootElementId from './app.config';
import { openCaptcha } from './services/captchaService';

// Expose service to external apps
Roblox.CaptchaService = {
  openCaptcha
};

function renderApp() {
  const entryPoint = document.getElementById(rootElementId);
  if (entryPoint) {
    render(<App />, entryPoint);
  } else {
    // Recursively call renderApp if target div not found
    // Callback will be triggered before every repaint
    window.requestAnimationFrame(renderApp);
  }
}

ready(() => {
  if (rootElementId) {
    renderApp();
  }
});
