import { create } from "zustand";
import { Gender, TAuthMetadataV2Response } from "@rbx/authentication-common/types/signupTypes";
import type { Birthday } from "@rbx/authentication-common/utils/birthdayUtils";

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
  username: "",
  password: "",
  gender: Gender.unknown,
  agreementIds: [],
  metadataV2: null,
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
