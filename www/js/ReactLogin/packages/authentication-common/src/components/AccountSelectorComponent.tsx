import { useEffect } from "react";
import { AccountSelectorService } from "Roblox";
import { TAccountSelectorModalParameters } from "../types/accountSelectorTypes";

export const AccountSelectorComponent = ({
  containerId,
  users,
  invalidUsers,
  onAccountSelection,
  onAccountSelectorAbandoned,
  titleText,
  helpText,
  translate,
}: TAccountSelectorModalParameters): JSX.Element => {
  const AccountSelectorParameters = {
    containerId,
    users,
    invalidUsers,
    onAccountSelection,
    onAccountSelectorAbandoned,
    titleText,
    helpText,
    translate,
  };

  useEffect(() => {
    if (users.length > 0 && AccountSelectorService) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      AccountSelectorService.renderAccountSelectorModal(AccountSelectorParameters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, invalidUsers]);

  return <div id={containerId} />;
};

export default AccountSelectorComponent;
