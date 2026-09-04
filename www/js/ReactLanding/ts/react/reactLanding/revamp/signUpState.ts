import { create } from 'zustand';
import {
  maxSignUpAge,
  minSignUpAge,
  usernameValidationMessageMap,
  validateUsernameContext,
  validationMessages
} from '../constants/signupConstants';
import { Gender, TAuthMetadataV2Response } from '../../common/types/signupTypes';
import getInvalidUsernameMessage from '../../common/utils/usernameValidationUtils';
import { validateUsername } from '../services/signupService';
import { parseErrorCode } from '../../common/utils/requestUtils';
import { constructUTCDatePartial } from './utils/date';

export type Birthday = {
  year?: number;
  month?: number;
  day?: number;
};

export type SignUpState = {
  birthday: Birthday;
  username: string;
  password: string;
  gender: Gender;
  agreementIds: string[];
  metadataV2: TAuthMetadataV2Response | null;
};

export const useSignup = create<SignUpState>()(() => ({
  birthday: {},
  username: '',
  password: '',
  gender: Gender.unknown,
  agreementIds: [],
  metadataV2: null
}));

export const setBirthdayYear = (year: number): void =>
  useSignup.setState(({ birthday }) => ({ birthday: { ...birthday, year } }));

export const setBirthdayMonth = (month: number): void =>
  useSignup.setState(({ birthday }) => ({ birthday: { ...birthday, month } }));

export const setBirthdayDay = (day: number): void =>
  useSignup.setState(({ birthday }) => ({ birthday: { ...birthday, day } }));

export const setUsername = (username: string): void => useSignup.setState({ username });
export const setPassword = (password: string): void => useSignup.setState({ password });
export const setGender = (gender: Gender): void => useSignup.setState({ gender });
export const setAgreementIds = (agreementIds: string[]): void =>
  useSignup.setState({ agreementIds });
export const setMetadataV2 = (metadataV2: TAuthMetadataV2Response): void =>
  useSignup.setState({ metadataV2 });

/**
 * Attempts to construct a valid birthday date from a {@link Birthday}.
 * @returns the valid {@link Date}, `null` if the birthday is invalid, or `undefined` it could not
 * be determined if the date is valid or not (because one of the date parts was `undefined`).
 */
export const constructValidUTCBirthdate = ({
  year,
  month,
  day
}: Birthday): Date | null | undefined => {
  const birthdate = constructUTCDatePartial(year, month, day);
  if (birthdate == null) {
    return birthdate;
  }

  const nowLocal = new Date();
  const nowUTC = new Date(
    Date.UTC(
      nowLocal.getUTCFullYear(),
      nowLocal.getUTCMonth(),
      nowLocal.getUTCDate(),
      nowLocal.getUTCHours(),
      nowLocal.getUTCMinutes(),
      nowLocal.getUTCSeconds()
    )
  );
  // If today is a leap day, subtracting 5 years will turn the date to March 1st.
  // Meaning, users born on March 1st trying to register on Feb 29th would not initially see an
  // error message until they submit the form. So instead, we set the day to the 28th.
  if (nowUTC.getDate() === 29 && nowUTC.getMonth() === 1) {
    nowUTC.setDate(28);
  }
  nowUTC.setUTCHours(0, 0, 0, 0);

  const maximumBirthday = new Date(nowUTC);
  maximumBirthday.setUTCFullYear(maximumBirthday.getUTCFullYear() - minSignUpAge);

  const minimumBirthday = new Date(nowUTC);
  minimumBirthday.setUTCFullYear(minimumBirthday.getUTCFullYear() - maxSignUpAge);

  return minimumBirthday <= birthdate && birthdate <= maximumBirthday ? birthdate : null;
};

export const usernameValidationMessage = async (
  username: string,
  birthdate: Date | null
): Promise<string> => {
  if (username === '') {
    return validationMessages.usernameRequired;
  }

  const localValidationMessage = getInvalidUsernameMessage(username);
  if (localValidationMessage !== '') {
    return localValidationMessage;
  }

  if (birthdate == null) {
    return validationMessages.birthdayRequired;
  }

  try {
    const response = await validateUsername({
      username,
      context: validateUsernameContext,
      birthday: birthdate
    });
    return usernameValidationMessageMap.get(response.code) ?? ''; // TODO: this should not be an empty string
  } catch (error) {
    const errorCode = parseErrorCode(error);
    return errorCode === 2 ? validationMessages.birthdayRequired : ''; // TODO: this should not be an empty string
  }
};
