import React, { useState } from 'react';
import { useTranslation } from 'react-utilities';
import { Loading } from 'react-style-guide';
import { Button } from '@rbx/foundation-ui';
import LoginAccountSwitcher from '../../components/LoginAccountSwitcher';
import { containerConstants, loginAccountSwitcherStrings } from '../../constants/loginConstants';
import { defaultRedirect } from '../../../common/utils/browserUtils';
import { startLogin } from '../loginState';
import { TLoggedInUsers } from '../../../common/types/accountSwitcherTypes';
import { sendAuthButtonClickEvent } from '../../../accountSwitcher/services/eventService';
import EVENT_CONSTANTS from '../../../common/constants/eventsConstants';
import { getAccountSwitchingSignupUrl } from '../../utils/loginUtils';

const SwitchAccount = ({ loggedInUsers }: { loggedInUsers: TLoggedInUsers }): JSX.Element => {
  const { translate } = useTranslation();
  const [accountSelected, setAccountSelected] = useState(false);
  if (accountSelected) {
    return (
      <div className='height-full flex items-center'>
        <Loading />
      </div>
    );
  }

  const createAccountUrl = getAccountSwitchingSignupUrl();
  const handleAddAccount = () => startLogin({ switchAccount: 'adding-account' });
  const handleAddAccountClick = () => {
    sendAuthButtonClickEvent(
      EVENT_CONSTANTS.context.accountSwitcherLogin,
      EVENT_CONSTANTS.btn.addAccount
    );
    handleAddAccount();
  };

  return (
    <div className='login-revamp-account-switcher flex flex-col width-full gap-xlarge'>
      <div className='flex flex-col gap-xsmall'>
        <h2 className='content-emphasis text-heading-large padding-none'>
          {translate(loginAccountSwitcherStrings.HeaderChooseAnAccount)}
        </h2>
        <span className='content-default text-body-large'>
          {translate(loginAccountSwitcherStrings.HeaderPickUpWhereYouLeftOff)}
        </span>
      </div>
      <LoginAccountSwitcher
        containerId={containerConstants.reactLoginAccountSwitcherContainer}
        onAccountSwitched={() => {
          // TODO: in the future this should switch to the `finish` step once `finish` is a separate page from the `login` step.
          setAccountSelected(true);
          defaultRedirect(); // navigate home after switching accounts
        }}
        handleAddAccount={handleAddAccount}
        suppressAddAccountRow
        removeInvalidActiveUser
        translate={translate}
        loggedInUsers={loggedInUsers}
      />
      <div className='flex flex-col gap-medium'>
        <Button size='Medium' variant='Standard' onClick={handleAddAccountClick}>
          {translate(loginAccountSwitcherStrings.ActionSignInToAnotherAccount)}
        </Button>
        <Button
          size='Medium'
          variant='Standard'
          as='a'
          href={createAccountUrl}
          onClick={() =>
            sendAuthButtonClickEvent(
              EVENT_CONSTANTS.context.accountSwitcherLogin,
              EVENT_CONSTANTS.btn.createAccount
            )
          }>
          {translate(loginAccountSwitcherStrings.ActionCreateAccountFromSwitcher)}
        </Button>
      </div>
    </div>
  );
};

export default SwitchAccount;
