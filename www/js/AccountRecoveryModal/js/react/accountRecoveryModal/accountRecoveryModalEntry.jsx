import { ready } from 'core-utilities';
import React from 'react';
import { render } from 'react-dom';
import Roblox from 'Roblox';
import App from './App';
import { rootElementId } from './app.config';
import '../../../css/accountRecoveryModal/accountRecoveryModal.scss';
import { openAccountRecoveryModal } from './services/accountRecoveryModalService';

Roblox.AccountRecoveryModalService = {
  openAccountRecoveryModal
};

ready(() => {
  if (document.getElementById(rootElementId)) {
    render(<App />, document.getElementById(rootElementId));
  }
});
