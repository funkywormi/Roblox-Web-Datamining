import React from "react";
import { WithTranslationsProps } from "@rbx/core-scripts/legacy/react-utilities";
import { TLoggedInUsers } from "@rbx/authentication-common/types/accountSwitcherTypes";
import AccountSwitcherContainer from "../../accountSwitcher/containers/AccountSwitcherContainer";
import useIsAccountSwitcherAvailableForBrowser from "../../accountSwitcher/hooks/useIsAccountSwitcherAvailableForBrowser";

export type loginAccountSwitcherProps = {
  containerId: string;
  titleText?: string;
  helpText?: string;
  onAccountSwitched: () => void;
  handleAddAccount: () => void;
  suppressAddAccountRow?: boolean;
  removeInvalidActiveUser: boolean;
  isModal?: boolean;
  translate: WithTranslationsProps["translate"];
  loggedInUsers?: TLoggedInUsers;
};

export const LoginAccountSwitcher = ({
  containerId,
  titleText,
  helpText,
  onAccountSwitched,
  handleAddAccount,
  suppressAddAccountRow,
  removeInvalidActiveUser,
  isModal,
  translate,
  loggedInUsers,
}: loginAccountSwitcherProps): JSX.Element => {
  const [isAccountSwitchingEnabledForBrowser] = useIsAccountSwitcherAvailableForBrowser();

  return (
    <div id={containerId}>
      {isAccountSwitchingEnabledForBrowser ? (
        <AccountSwitcherContainer
          titleText={titleText}
          helpText={helpText}
          onAccountSwitched={onAccountSwitched}
          handleAddAccount={handleAddAccount}
          suppressAddAccountRow={suppressAddAccountRow}
          removeInvalidActiveUser={removeInvalidActiveUser}
          isModal={isModal}
          translate={translate}
          loggedInUsers={loggedInUsers}
        />
      ) : null}
    </div>
  );
};

export default LoginAccountSwitcher;
