import { ready } from 'core-utilities';
import React from 'react';
import { render } from 'react-dom';
import Roblox from 'Roblox';
import App from './App';
import { rootElementId } from './app.config';
import '../../../css/crossDeviceLoginDisplayCodeModal/crossDeviceLoginDisplayCodeModal.scss';
import { openModal } from './services/crossDeviceLoginDisplayCodeService';

Roblox.CrossDeviceLoginDisplayCodeService = {
  openModal
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
  renderApp();
});
