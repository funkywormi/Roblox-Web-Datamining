import React from "react";
import { TLoggedInUsers } from "@rbx/authentication-common/types/accountSwitcherTypes";
import AccountSwitcherContainer from "../../accountSwitcher/containers/AccountSwitcherContainer";
import { ThumbnailsAvatarHeadshot } from "../../accountSwitcher/components/ThumbnailsAvatarHeadshot";
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
  loggedInUsers,
}: loginAccountSwitcherProps): JSX.Element => {
  const [isAccountSwitchingEnabledForBrowser] = useIsAccountSwitcherAvailableForBrowser();

  return (
    <div id={containerId}>
      {isAccountSwitchingEnabledForBrowser ? (
        <AccountSwitcherContainer
          AvatarHeadshot={ThumbnailsAvatarHeadshot}
          titleText={titleText}
          helpText={helpText}
          onAccountSwitched={onAccountSwitched}
          handleAddAccount={handleAddAccount}
          suppressAddAccountRow={suppressAddAccountRow}
          removeInvalidActiveUser={removeInvalidActiveUser}
          isModal={isModal}
          loggedInUsers={loggedInUsers}
        />
      ) : null}
    </div>
  );
};

export default LoginAccountSwitcher;
