import transport from './requestTransport';
import { getEmailUrlConfig, getEmailVerificationUrlConfig } from '../constants/urlConstants';

export type UserEmailStatus = {
  emailAddress?: string | null;
  verified?: boolean;
  isEmailVerified?: boolean;
};

type EmailErrorResponse = {
  data: { errors?: { code: number }[] };
};

export const sendEmailVerification = () => {
  const urlConfig = getEmailVerificationUrlConfig();
  return transport.post(urlConfig).then(
    () => {
      return true;
    },
    () => {
      return false;
    }
  );
};

export const updateEmailAddress = (formData: { emailAddress: string }) => {
  const urlConfig = getEmailUrlConfig();
  return transport.post(urlConfig, formData).then(
    () => {
      return true;
    },
    (e: EmailErrorResponse) => {
      return e.data.errors && e.data.errors[0]!.code;
    }
  );
};

export const getUserEmailAddress = () => {
  const urlConfig = getEmailUrlConfig();
  return transport.get(urlConfig).then(
    ({ data }) => {
      return (data as UserEmailStatus | undefined)?.emailAddress;
    },
    () => {
      return false as const;
    }
  );
};

export const validateEmailAddress = (email: string) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

export const getUserEmailStatus = () => {
  const urlConfig = getEmailUrlConfig();
  return transport.get(urlConfig).then(
    ({ data }) => {
      return data as UserEmailStatus;
    },
    () => {
      return false as const;
    }
  );
};
