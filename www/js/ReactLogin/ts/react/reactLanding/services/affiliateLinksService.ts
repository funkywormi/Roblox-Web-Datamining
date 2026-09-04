import { httpService } from 'core-utilities';
import { urlConstants } from '../constants/affiliateLinksConstants';
import { sendQualifiedSignupEvent } from './eventService';

export const qualifiedSignup = async (params: {
  referralUrl: string;
  linkId: string;
  linkType: string;
}): Promise<void> => {
  const urlConfig = {
    withCredentials: true,
    url: urlConstants.qualifiedSignup
  };
  try {
    sendQualifiedSignupEvent(params.referralUrl, params.linkId, 'initial', params.linkType);
    await httpService.post(urlConfig, params);
  } catch (e) {
    // NOTE (jcountryman, 08/12/2024): Silently fail and not block the signup flow
    sendQualifiedSignupEvent(params.referralUrl, params.linkId, 'error', params.linkType);
  }
  // NOTE (jcountryman, 08/12/2024): Provide crude time out to flush out all
  // events before code terminates
  await new Promise(resolve => setTimeout(resolve, 100));
};

export const qualifiedLogin = (params: {
  referralUrl: string;
  linkId: string;
  linkType: string;
  userDidLogIn: boolean;
}) => {
  // send and forget
  httpService
    .post({ withCredentials: true, url: urlConstants.qualifiedLogin }, params)
    .catch(error => {
      console.error('Failed to send login event for affiliate links:', error);
    });
};

export default {
  qualifiedSignup,
  qualifiedLogin
};
