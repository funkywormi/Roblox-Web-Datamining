import { localStorageService } from 'core-roblox-utilities';
import { urlConstants } from '../constants/loginConstants';

export const storeIdentityVerificationLoginTicket = (
  identityVerificationLoginTicket: string
): void => {
  localStorageService.setLocalStorage(
    'identityVerificationLoginTicket',
    identityVerificationLoginTicket
  );
};

export const startIdentityVerification = (): void => {
  const identityUrl = urlConstants.koreaIdVerification;
  window.location.href = identityUrl;
};

export default {
  storeIdentityVerificationLoginTicket,
  startIdentityVerification
};
