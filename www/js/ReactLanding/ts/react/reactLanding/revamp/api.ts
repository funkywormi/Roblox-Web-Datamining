import { AccountSwitcherService } from 'Roblox';
import { buildAuthParamsWithSecureAuthIntentAndClientKeyPair } from '../../common/hardwareBackedAuth/utils/requestUtils';
import { TSignupParams } from '../../common/types/signupTypes';
import { counters } from '../constants/signupConstants';
import { incrementEphemeralCounter } from '../services/eventService';
import { signup } from '../services/signupService';
import { handlePostSignup } from '../utils/signupUtils';

// eslint-disable-next-line import/prefer-default-export
export const signupWithParams = async (
  params: TSignupParams,
  returnUrlValue: string
): Promise<void> => {
  const { authParams } = await buildAuthParamsWithSecureAuthIntentAndClientKeyPair(params);
  const result = await signup(authParams);
  if (authParams.secureAuthenticationIntent) {
    incrementEphemeralCounter(counters.successWithSAI);
  }
  AccountSwitcherService?.storeAccountSwitcherBlob(result.accountBlob ? result.accountBlob : '');
  await handlePostSignup(returnUrlValue, result.userId.toString());
};
