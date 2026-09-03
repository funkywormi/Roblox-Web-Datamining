import { differenceInYears } from 'date-fns';

export const isUnder18 = (birthDay: number, birthMonth: number, birthYear: number): boolean => {
  return differenceInYears(new Date(), new Date(birthYear, birthMonth - 1, birthDay)) < 18;
};

export default { isUnder18 };
