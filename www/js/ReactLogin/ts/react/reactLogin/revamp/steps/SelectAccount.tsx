import React, { useState } from 'react';
import { useTranslation } from 'react-utilities';
import { LoginStep, backToLogin } from '../loginState';
import { FeatureLoginPage } from '../../../common/constants/translationConstants';
import { useLoginMutation } from '../common';
import AccountSelectorComponent from '../../../common/components/AccountSelectorComponent';
import { containerConstants } from '../../constants/loginConstants';
import { sendAccountSelectionEvent } from '../../services/eventService';
import { buildAccountSelectorHelpText } from '../../utils/loginUtils';

// TODO: consider redesigning this as a form step instead of a modal
const SelectAccount = ({
  credential,
  users
}: Omit<LoginStep & { step: 'select-account' }, 'step'>): JSX.Element | null => {
  const { translate } = useTranslation();
  const [selected, setSelected] = useState(false);
  const login = useLoginMutation();

  return selected ? null : (
    <AccountSelectorComponent
      containerId={containerConstants.reactAccountSelectorContainer}
      users={users}
      // since we are not allowing u13 users to login with otp for now,
      // there will not be invalid users
      invalidUsers={[]}
      onAccountSelection={userId => {
        if (!login.isPending) {
          sendAccountSelectionEvent(credential.type, userId);
          setSelected(true);
          login.mutate({
            credential,
            userId
          });
        }
      }}
      onAccountSelectorAbandoned={backToLogin}
      titleText={translate(FeatureLoginPage.LabelAccountSelector)}
      helpText={buildAccountSelectorHelpText(credential.type, translate)}
      translate={translate}
    />
  );
};

export default SelectAccount;
