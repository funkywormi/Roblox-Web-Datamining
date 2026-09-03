import './src/crossDeviceLoginConfirmCode/crossDeviceLoginConfirmCode.scss';
import ready from '@rbx/core-scripts/util/ready';
import { renderWithErrorBoundary } from '@rbx/core-scripts/react';
import App from '@rbx/authentication/crossDeviceLoginConfirmCode/App';
import {
  rootElementId,
  webAppPageRootElementId,
} from '@rbx/authentication/crossDeviceLoginConfirmCode/app.config';

ready(() => {
  const containerElement =
    document.getElementById(rootElementId) || document.getElementById(webAppPageRootElementId);

  if (containerElement) {
    renderWithErrorBoundary(<App />, containerElement);
  }
});
