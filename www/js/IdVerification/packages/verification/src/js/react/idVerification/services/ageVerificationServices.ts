import * as eventStreamService from '@rbx/core-scripts/event-stream';
import transport from './requestTransport';
import {
  startPersonaIdVerificationUrlConfig,
  getPersonaVerificationStatusUrlConfig,
  getVerifiedAgeUrlConfig
} from '../constants/urlConstants';
import { ModalEvent } from '../constants/viewConstants';
import type { IdVerificationEvent } from '../constants/idVerificationEventStreamConstants';

export type StartVerificationResponse = {
  verificationLink?: string;
  sessionIdentifier?: string;
  daysUntilNextVerification?: number;
};

export type VerifiedAgeResponse = {
  isVerified?: boolean;
  verifiedAge?: number;
};

export type VerificationStatusResponse = {
  sessionStatus?: number;
  sessionErrorCode?: number;
  isSeventeenPlus?: boolean;
};

export type VerificationSuccessCallback = (isUserOldEnough: boolean, didVerifyAge: boolean) => void;

export const startPersonaIdVerification = (): Promise<StartVerificationResponse | false> => {
  const urlConfig = startPersonaIdVerificationUrlConfig();
  const params = { generateLink: true };
  return transport.post(urlConfig, params).then(
    ({ data }) => {
      return data as StartVerificationResponse;
    },
    () => {
      return false as const;
    }
  );
};

export const getVerifiedAge = (): Promise<VerifiedAgeResponse> => {
  const urlConfig = getVerifiedAgeUrlConfig();
  return transport.get(urlConfig).then(({ data }) => {
    return data as VerifiedAgeResponse;
  });
};

export const getPersonaVerificationStatus = (token: string): Promise<VerificationStatusResponse> => {
  const urlConfig = getPersonaVerificationStatusUrlConfig();
  const params = { token };
  return transport.get(urlConfig, params).then(({ data }) => {
    return data as VerificationStatusResponse;
  });
};

export const sendIdVerificationEvent = (event: IdVerificationEvent, params: { origin: string }) => {
  eventStreamService.sendEventWithTarget(event.type, event.context, {
    ...event.params,
    origin: params.origin
  });
};

export const startVerificationFlow = () =>
  new Promise<[boolean, boolean]>(resolve => {
    const event = new CustomEvent(ModalEvent.OpenIdentityVerificationModal, {
      detail: {
        successCallback: (isUserOldEnough: boolean, didVerifyAge: boolean) => {
          resolve([isUserOldEnough, didVerifyAge]);
        }
      }
    });
    window.dispatchEvent(event);
  });
