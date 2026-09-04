import React, { useEffect } from 'react';
import { AccountSelectorService } from 'Roblox';
import { TAccountSelectorModalParameters } from '../types/accountSelectorTypes';

export const AccountSelectorComponent = ({
  containerId,
  users,
  invalidUsers,
  onAccountSelection,
  onAccountSelectorAbandoned,
  titleText,
  helpText,
  translate
}: TAccountSelectorModalParameters): JSX.Element => {
  const AccountSelectorParameters = {
    containerId,
    users,
    invalidUsers,
    onAccountSelection,
    onAccountSelectorAbandoned,
    titleText,
    helpText,
    translate
  };

  useEffect(() => {
    if (users.length > 0 && AccountSelectorService) {
      AccountSelectorService.renderAccountSelectorModal(AccountSelectorParameters);
    }
  }, [users, invalidUsers]);

  return <div id={containerId} />;
};

export default AccountSelectorComponent;
