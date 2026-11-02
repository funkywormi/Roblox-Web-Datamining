import React, { useState } from "react";
import { Icon } from "@rbx/foundation-ui";
import { useTranslations } from "@rbx/www-common/i18n";
import { TUserData } from "@rbx/authentication-common/types/userTypes";
import { urlQueryConstants } from "@rbx/authentication-common/constants/urlConstants";
import { AccountSwitcherAvatar } from "./AccountSwitcherAvatar";
import { accountSwitcherStrings } from "../constants/accountSwitcherConstants";

export type AccountSwitcherListVariant = "legacy" | "foundation";

export type FoundationAccountSwitcherListProps = {
  activeUser?: TUserData;
  handleAddAccount: () => void;
  isAccountLimitReached: boolean;
  onAccountSelection: (userId: number) => void;
  suppressAddAccountRow?: boolean;
  users: TUserData[];
};

type FoundationAccountSwitcherAccountRowProps = {
  isActive?: boolean;
  onAccountSelection: (userId: number) => void;
  user: TUserData;
};

const FoundationAccountSwitcherAccountContent = ({
  isActive = false,
  user,
}: {
  isActive?: boolean;
  user: TUserData;
}): React.ReactElement => (
  <React.Fragment>
    <div className="account-selection-thumbnail">
      <AccountSwitcherAvatar userId={user.id} />
    </div>
    <div className="account-selection-name-container">
      <p className="account-selection-displayname">{user.displayName || user.name}</p>
      <p className="account-selection-username">
        {user.name ? urlQueryConstants.atSign + user.name : ""}
      </p>
    </div>
    {isActive && (
      <Icon
        className="account-switcher-foundation-check content-system-success"
        name="icon-regular-circle-check"
        size="Medium"
      />
    )}
  </React.Fragment>
);

const FoundationAccountSwitcherAccountRow = ({
  isActive = false,
  onAccountSelection,
  user,
}: FoundationAccountSwitcherAccountRowProps): React.ReactElement => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isActive) {
    return (
      <li className="account-selection-list-item">
        <div
          aria-current="true"
          className="active-account account-switcher-foundation-row"
          data-testid="foundation-account-switcher-active-account-row"
        >
          <FoundationAccountSwitcherAccountContent isActive user={user} />
        </div>
      </li>
    );
  }

  const handleSelect = () => {
    if (!isSubmitting) {
      setIsSubmitting(true);
      try {
        onAccountSelection(user.id);
      } catch {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <li className="account-selection-list-item">
      <button
        className="account-selection account-switcher-foundation-row"
        data-testid="foundation-account-switcher-account-row"
        onClick={handleSelect}
        type="button"
      >
        <FoundationAccountSwitcherAccountContent user={user} />
        {isSubmitting && <div className="spinner spinner-sm spinner-no-margin spinner-block" />}
      </button>
    </li>
  );
};

const FoundationAccountSwitcherAddAccountRow = ({
  handleAddAccount,
}: {
  handleAddAccount: () => void;
}): React.ReactElement => {
  const translate = useTranslations("Authentication.AccountSwitch");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = () => {
    setIsSubmitting(true);
    handleAddAccount();
  };

  return (
    <li className="account-selection-list-item">
      <button
        className="account-selection account-switcher-foundation-row"
        data-testid="foundation-account-switcher-add-account-row"
        onClick={handleSelect}
        type="button"
      >
        <div className="account-switcher-icon-add">
          <span className="icon-plus" />
        </div>
        <div className="account-selection-name-container">
          <p className="account-selection-add-account">
            {translate(accountSwitcherStrings.ActionAddAccount)}
          </p>
        </div>
        {isSubmitting && <div className="spinner spinner-sm spinner-block" />}
      </button>
    </li>
  );
};

const FoundationAccountSwitcherList = ({
  activeUser,
  handleAddAccount,
  isAccountLimitReached,
  onAccountSelection,
  suppressAddAccountRow = false,
  users,
}: FoundationAccountSwitcherListProps): React.ReactElement => (
  <ul className="account-switcher-list account-switcher-foundation-list">
    {activeUser && (
      <FoundationAccountSwitcherAccountRow
        isActive
        key={activeUser.id}
        onAccountSelection={onAccountSelection}
        user={activeUser}
      />
    )}
    {users.map(user => (
      <FoundationAccountSwitcherAccountRow
        key={user.id}
        onAccountSelection={onAccountSelection}
        user={user}
      />
    ))}
    {!isAccountLimitReached && !suppressAddAccountRow && (
      <FoundationAccountSwitcherAddAccountRow handleAddAccount={handleAddAccount} />
    )}
  </ul>
);

export default FoundationAccountSwitcherList;
