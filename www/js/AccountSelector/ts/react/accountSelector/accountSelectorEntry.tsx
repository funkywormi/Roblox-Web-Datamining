import Roblox from 'Roblox';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import AccountSelectorContainer from './containers/AccountSelectorContainer';
import { TRenderAccountSelectorModal } from '../common/types/accountSelectorTypes';
import { AccountSelectorService } from './interface';
import '../../../css/accountSelector/accountSelector.scss';

export const renderAccountSelectorModal: TRenderAccountSelectorModal = ({
  containerId,
  users,
  invalidUsers,
  onAccountSelection,
  onAccountSelectorAbandoned,
  titleText,
  helpText,
  translate
}): boolean => {
  const container = document.getElementById(containerId);
  if (container != null) {
    // Remove any existing instances of the app.
    unmountComponentAtNode(container);

    render(
      <AccountSelectorContainer
        users={users}
        invalidUsers={invalidUsers}
        onAccountSelection={onAccountSelection}
        onAccountSelectorAbandoned={onAccountSelectorAbandoned}
        titleText={titleText}
        helpText={helpText}
        translate={translate}
      />,
      container
    );
    return true;
  }
  return false;
};

const AccountSelectorService = {
  renderAccountSelectorModal
};

Object.assign(Roblox, {
  AccountSelectorService
});

export default renderAccountSelectorModal;
