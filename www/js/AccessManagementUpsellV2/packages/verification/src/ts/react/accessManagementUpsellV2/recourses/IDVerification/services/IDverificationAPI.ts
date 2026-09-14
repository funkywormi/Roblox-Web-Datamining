import { httpService } from 'core-utilities';
import {
  startPersonaIdVerificationUrlConfig,
  getPersonaVerificationStatusUrlConfig
} from '../constants/urlConstants';
import { PersonaTemplate, VerificationErrorCode } from '../../../enums';

export const startPersonaIdVerification = (
  ageEstimation: boolean,
  parentVerification: boolean,
  template?: PersonaTemplate
) => {
  const urlConfig = startPersonaIdVerificationUrlConfig();
  const params = {
    generateLink: true,
    ageEstimation,
    parentVerification,
    // Only appeals (and other feature-specific) recourses send a template; the
    // default IDV/FAE paths leave it unset so the backend picks its default.
    ...(template && { template })
  };
  return httpService
    .post(urlConfig, params)
    .then(({ data }) => {
      return data;
    })
    .catch(err => {
      const errorCode = httpService.parseErrorCode(err) as VerificationErrorCode;
      throw new Error(`Error to start ID verification: ${errorCode || 'unknown'}`);
    });
};

export const getPersonaVerificationStatus = (token: string) => {
  const urlConfig = getPersonaVerificationStatusUrlConfig();
  const params = { token };
  return httpService
    .get(urlConfig, params)
    .then(({ data }) => {
      return data;
    })
    .catch(err => {
      const errorCode = httpService.parseErrorCode(err) as VerificationErrorCode;
      throw new Error(`Error to get ID verification status: ${errorCode || 'unknown'}`);
    });
};
