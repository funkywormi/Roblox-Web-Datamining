import { Gender, TSignupParams } from '../../common/types/signupTypes';
import { IOtpSession } from '../../emailVerifyCodeModal/interface';

export type BuildSignupParamsInput = {
  username: string;
  password: string;
  gender: Gender;
  birthdayDay: string;
  birthdayMonth: string;
  birthdayYear: string;
  dataToken?: string;
  email?: string;
  locale?: string | null;
  captchaId?: string;
  captchaToken?: string;
  agreementIds?: string[];
  otpSession: IOtpSession;
  identityVerificationResultToken?: string | null;
  accountBlob?: string | null;
  auditSystemContent?: TSignupParams['auditSystemContent'];
};

const signupMonthIndexes: Record<string, number> = {
  Jan: 0,
  January: 0,
  Feb: 1,
  February: 1,
  Mar: 2,
  March: 2,
  Apr: 3,
  April: 3,
  May: 4,
  Jun: 5,
  June: 5,
  Jul: 6,
  July: 6,
  Aug: 7,
  August: 7,
  Sep: 8,
  September: 8,
  Oct: 9,
  October: 9,
  Nov: 10,
  November: 10,
  Dec: 11,
  December: 11
};

const invalidDate = (): Date => new Date(Number.NaN);

export const buildSignupBirthday = (day: string, month: string, year: string): Date => {
  const dayNumber = Number(day);
  const yearNumber = Number(year);
  const monthIndex = signupMonthIndexes[month];

  if (
    !day ||
    !year ||
    monthIndex === undefined ||
    !Number.isInteger(dayNumber) ||
    !Number.isInteger(yearNumber)
  ) {
    return invalidDate();
  }

  const birthday = new Date(yearNumber, monthIndex, dayNumber);
  if (
    birthday.getFullYear() !== yearNumber ||
    birthday.getMonth() !== monthIndex ||
    birthday.getDate() !== dayNumber
  ) {
    return invalidDate();
  }

  return birthday;
};

/**
 * Builds the request consumed by the production `/v2/signup` endpoint.
 *
 * Callers remain responsible for reading browser-backed values (such as the
 * account-switcher blob and identity-verification token) and deciding which
 * regional agreement IDs apply. Keeping those effects outside this function
 * makes request construction reusable by another signup surface without
 * changing the production control flow.
 */
export const buildSignupParams = ({
  username,
  password,
  gender,
  birthdayDay,
  birthdayMonth,
  birthdayYear,
  dataToken,
  email,
  locale,
  captchaId,
  captchaToken,
  agreementIds,
  otpSession,
  identityVerificationResultToken,
  accountBlob,
  auditSystemContent
}: BuildSignupParamsInput): TSignupParams => {
  const params: TSignupParams = {
    username,
    password,
    birthday: buildSignupBirthday(birthdayDay, birthdayMonth, birthdayYear),
    gender,
    isTosAgreementBoxChecked: true
  };

  if (dataToken) {
    params.dataToken = dataToken;
  }
  if (email) {
    params.email = email;
  }
  if (locale) {
    params.locale = locale;
  }
  if (captchaId && captchaToken) {
    params.captchaId = captchaId;
    params.captchaToken = captchaToken;
  }
  if (agreementIds) {
    params.agreementIds = agreementIds;
  }
  if (otpSession.otpSessionToken && otpSession.otpContactType) {
    params.otpSession = otpSession;
  }
  if (identityVerificationResultToken) {
    params.identityVerificationResultToken = identityVerificationResultToken;
  }
  if (accountBlob) {
    params.accountBlob = accountBlob;
  }
  if (auditSystemContent) {
    params.auditSystemContent = auditSystemContent;
  }

  return params;
};
