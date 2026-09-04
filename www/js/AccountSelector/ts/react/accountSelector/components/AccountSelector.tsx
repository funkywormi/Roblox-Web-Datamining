import React from 'react';
import { WithTranslationsProps } from 'react-utilities';
import { TUserData } from '../../common/types/accountSelectorTypes';
import AccountSelection from './AccountSelection';

export type accountSelectorProps = {
  users: TUserData[];
  onAccountSelection: (userId: number) => void;
  disabled: boolean;
  translate: WithTranslationsProps['translate'];
};

export const AccountSelector = ({
  users,
  onAccountSelection,
  disabled,
  translate
}: accountSelectorProps): JSX.Element => {
  return (
    <ul className='account-selector'>
      {users.map(user => (
        // iterator elements should have a unique key
        <AccountSelection
          key={user.id}
          userId={user.id}
          username={user.name}
          displayName={user.displayName}
          onAccountSelection={onAccountSelection}
          disabled={disabled}
          translate={translate}
        />
      ))}
    </ul>
  );
};

export default AccountSelector;
