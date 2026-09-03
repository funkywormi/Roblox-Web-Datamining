import { TranslateFunction } from "react-utilities";
import { RobloxIntl } from "Roblox";
import { TDropdownOption } from "../../../types/commonTypes";
import {
  BirthdateDropdownOption,
  BirthdatePart,
  TUserBirthdate,
} from "../../../types/accountInformationTypes";
import accountInfoTranslationConstants from "../constants/contentConstants/accountInfoTranslationConstants";
import birthdayUtils from "../utils/birthdayUtils";
import { minimumValidAge, maximumValidAge } from "../constants/accountInfo/accountInfoConstants";

type BirthdateParts = {
  [key: string]: BirthdatePart;
  day: BirthdatePart.day;
  month: BirthdatePart.month;
  year: BirthdatePart.year;
};

const partMapping: BirthdateParts = {
  day: BirthdatePart.day,
  month: BirthdatePart.month,
  year: BirthdatePart.year,
};

function shouldIncludeBoundaryYear(currentDate: Date, maximumValidAgeYear: number): boolean {
  const candidateDOB: TUserBirthdate = {
    birthYear: currentDate.getFullYear() - (maximumValidAgeYear + 1),
    birthMonth: 12,
    birthDay: 31,
  };
  // if date is not the last day of the year, then it's possible that the user's age not exceed maximumValidAgeYear on that date
  const candidateAge = birthdayUtils.calculateAge(candidateDOB);
  return candidateAge === maximumValidAgeYear;
}

// visible for testing
export const computeDayOptions = (
  translate: TranslateFunction,
  intl: RobloxIntl,
  birthdate: TUserBirthdate,
): TDropdownOption[] => {
  const days: TDropdownOption[] = [];
  const key = partMapping.day.toLowerCase();

  let numberOfDays = 31;
  if (birthdayUtils.birthdateSeletionCompleted(birthdate)) {
    const { birthYear, birthMonth } = birthdate;
    const date = new Date(birthYear, birthMonth, 0);
    numberOfDays = date.getDate();
  } else {
    days.push({
      key,
      label: translate(accountInfoTranslationConstants.birthdate.calendar.day),
      value: 0,
    });
  }

  for (let i = 1; i <= numberOfDays; i++) {
    const day = i.toString();
    const name = intl.getFormattedDateString(
      day,
      translate(accountInfoTranslationConstants.birthdate.calendar.day),
    );

    days.push({ key, label: name, value: day });
  }

  return days;
};

// visible for testing
export const computeMonthOptions = (
  translate: TranslateFunction,
  intl: RobloxIntl,
  birthdate: TUserBirthdate,
): TDropdownOption[] => {
  const interMonths = intl.getMonthsI18n(
    "short",
    translate(accountInfoTranslationConstants.birthdate.calendar.month),
  );
  const key = partMapping.month.toLowerCase();
  const monthOptions: TDropdownOption[] = interMonths.map(({ name, value }) => {
    return { key, label: name, value };
  });
  if (!birthdayUtils.birthdateSeletionCompleted(birthdate)) {
    monthOptions.unshift({
      key,
      label: translate(accountInfoTranslationConstants.birthdate.calendar.month),
      value: null,
    });
  }
  return monthOptions;
};

// visible for testing
export const computeYearOptions = (
  translate: TranslateFunction,
  intl: RobloxIntl,
  selectedBirthdate: TUserBirthdate,
  minimumValidAgeYear: number,
  maximumValidAgeYear: number,
): TDropdownOption[] => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();

  const years: TDropdownOption[] = [];
  const key = partMapping.year.toLowerCase();

  const extraYear = shouldIncludeBoundaryYear(currentDate, maximumValidAgeYear) ? 1 : 0;
  for (let i = minimumValidAgeYear; i <= maximumValidAgeYear + extraYear; i++) {
    const value = year - i;
    const name = intl.getFormattedDateString(
      value.toString(),
      translate(accountInfoTranslationConstants.birthdate.calendar.year),
    );
    const option: TDropdownOption = { key, label: name, value };
    years.push(option);
  }
  if (!birthdayUtils.birthdateSeletionCompleted(selectedBirthdate)) {
    years.unshift({
      key,
      label: translate(accountInfoTranslationConstants.birthdate.calendar.year),
      value: null,
    });
  }

  return years;
};

/**
 * NOTE: if birthdate is undefined, the resulting BirthdateDropdownOption will
 * have currentValue set to [[undefined]] and options property will contain a
 * single element whose `value` is set to [[null]]. See example below.
 *
 * {
 *  id: <partName>Dropdown,
 *  class: <partName>,
 *  name: <birth<partName>,
 *  options: [{key: <partName>, label: <partName>, value: null}],
 *  currentValue: undefined
 * }
 */
const buildBirthdatePartDropdownOptions = (
  birthdatePart: BirthdatePart,
  translate: TranslateFunction,
  intl: RobloxIntl,
  selectedBirthdate?: TUserBirthdate,
  minimumValidAgeYear: number = minimumValidAge,
  maximumValidAgeYear: number = maximumValidAge,
): BirthdateDropdownOption => {
  const partName = birthdatePart.toString();
  const buildOptions = () => {
    // if birthdate is undefined, return the default birthdate parts.
    if (!selectedBirthdate) {
      return [{ key: partName, label: partName, value: null }];
    }
    switch (partName) {
      case BirthdatePart.day:
        return computeDayOptions(translate, intl, selectedBirthdate);
      case BirthdatePart.month:
        return computeMonthOptions(translate, intl, selectedBirthdate);
      case BirthdatePart.year:
        return computeYearOptions(
          translate,
          intl,
          selectedBirthdate,
          minimumValidAgeYear,
          maximumValidAgeYear,
        );
      default:
        // birthdate is undefined, return the default parts and value.
        return [{ key: partName, label: partName, value: null }];
    }
  };

  return {
    id: `${partName.toLowerCase()}Dropdown`,
    class: partName.toLowerCase(),
    name: `birth${partName}`,
    options: buildOptions(),
    currentValue: selectedBirthdate ? selectedBirthdate[`birth${birthdatePart}`] : undefined,
  };
};

/**
 * @param birthdatePart the BirthdatePart whose options we wish to compute.
 * @param translate: TranslateFunction instance
 * @param intl: RobloxIntl instance
 * @param birthdate birthdate to compute values against, e.g number of days in a
 * month depend on which calendar month we are in.
 * @param minimumValidAgeYear render drop down option based on minimum valid age
 * @param maximumValidAgeYear render drop down option based on maximum valid age
 * @returns sorted array of BirthdateDropdownOptions according to ordering
 * dictated by [[RobloxIntl]]. See buildBirthdatePartDropdownOptions above for
 * further details
 */
const buildBirthdateDropdownOptions = (
  translate: TranslateFunction,
  intl: RobloxIntl,
  selectedBirthdate?: TUserBirthdate,
  minimumValidAgeYear: number = minimumValidAge,
  maximumValidAgeYear: number = maximumValidAge,
): BirthdateDropdownOption[] => {
  const orderedBirthdateParts: BirthdateDropdownOption[] = [];

  // object mapping where each birthdate part corresponds to the sort index
  // e.g { month: 0, day: 1, year: 2 }
  const partOrdering = intl.getDateTimeFormatter().getOrderedDateParts();

  // Iterate over the ordering and populate orderedBirthdateParts according
  // to the sort order dictated by partOrdering. e.g: if month has sortIndex 1,
  // then put it at index 1 of the result array (orderedBirthdateParts)
  Object.entries(partOrdering).forEach(([partName, sortIndex]) => {
    const birthdatePart = partMapping[partName];
    if (!birthdatePart) {
      return;
    }
    orderedBirthdateParts[sortIndex] = buildBirthdatePartDropdownOptions(
      birthdatePart,
      translate,
      intl,
      selectedBirthdate,
      minimumValidAgeYear,
      maximumValidAgeYear,
    );
  });

  return orderedBirthdateParts;
};

export default buildBirthdateDropdownOptions;
