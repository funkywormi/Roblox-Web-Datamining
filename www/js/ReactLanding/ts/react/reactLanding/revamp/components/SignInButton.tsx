import React from 'react';
import { useTranslation } from 'react-utilities';
import { Button } from '@rbx/foundation-ui';
import { urlConstants, signupFormStrings } from '../../constants/signupConstants';
import { sendAuthButtonClickEvent } from '../../services/eventService';
import EVENT_CONSTANTS from '../../../common/constants/eventsConstants';
import { navigateToPage } from '../../../common/utils/browserUtils';

const { lrSignupForm } = EVENT_CONSTANTS.context;
const { lrSignInButton } = EVENT_CONSTANTS.btn;

const SignInButton = (): JSX.Element => {
  const { translate } = useTranslation();

  return (
    <Button
      size='Medium'
      style={{ minWidth: '150px', height: '40px' }}
      variant='Emphasis'
      onClick={() => {
        sendAuthButtonClickEvent(lrSignInButton, '', lrSignupForm);
        navigateToPage(urlConstants.login);
      }}>
      {translate(signupFormStrings.SignIn)}
    </Button>
  );
};

export default SignInButton;
