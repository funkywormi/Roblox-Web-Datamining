import { Intl } from "@rbx/core-scripts/legacy/Roblox";
import { TranslateFunction } from "@rbx/core-scripts/legacy/react-utilities";
import {
  AgeGateDOBGroupLabel,
  DateComponent,
  DateSelectorError,
  SelectableItem,
} from "../types/ageGate";
import { Item, SelectedItems } from "../types/common";

type RobloxIntl = Intl;

export const getDateOfBirthEntryErrors = (
  dobItems: SelectedItems<DateComponent>,
  t: TranslateFunction,
): DateSelectorError => {
  const allComponents = Object.keys(dobItems).map(key => ({ key, val: dobItems[key] }));
  const emptyComponents = allComponents.filter(component => !component.val);

  if (emptyComponents.length > 0) {
    return emptyComponents.reduce<DateSelectorError>(
      (acc, curr) => ({
        ...acc,
        [curr.key]: new Error(t("Response.InvalidBirthday")),
      }),
      {},
    );
  }

  const validDateObj = new Date(
    dobItems.year?.intVal ?? -1,
    (dobItems.month?.intVal ?? 0) - 1,
    dobItems.day?.intVal ?? -1,
  );
  const isUnparseableDate =
    Object.prototype.toString.call(validDateObj) !== "[object Date]" ||
    Number.isNaN(validDateObj.getTime());
  if (isUnparseableDate) {
    return { general: new Error(t("Response.InvalidBirthday")) };
  }

  const isValidDateComponents =
    validDateObj.getFullYear() === dobItems.year?.intVal &&
    validDateObj.getMonth() === (dobItems.month?.intVal ?? 0) - 1 &&
    validDateObj.getDate() === dobItems.day?.intVal;
  if (!isValidDateComponents) {
    return { general: new Error(t("Response.InvalidBirthday")) };
  }

  const today = new Date();
  const isBirthdayValid =
    validDateObj.getTime() < today.getTime() &&
    validDateObj.getFullYear() > today.getFullYear() - 100;
  if (!isBirthdayValid) {
    return { general: new Error(t("Response.InvalidBirthday")) };
  }

  return {};
};

// TODO(mhowell): unify this type with a selectable type that already exists in ../types/common
type DateOption = { value: string; label: string; intVal: number };

export const getDayOptions = (
  maxNumberOfDates: number,
  intl: RobloxIntl,
  t: TranslateFunction,
): DateOption[] =>
  Array.from({ length: maxNumberOfDates }, (_, i) => {
    const day = `0${i + 1}`.slice(-2);
    return {
      value: day,
      label: intl.getFormattedDateString(day, t("Label.Day")),
      intVal: parseInt(day, 10),
    };
  });

export const getYearOptions = (maxAgeGateAge: number, intl: RobloxIntl): DateOption[] => {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - maxAgeGateAge;
  return Array.from({ length: currentYear - minYear + 1 }, (_, i) => ({
    value: (currentYear - i).toString(),
    label: intl.getFormattedDateString((currentYear - i).toString(), "yyyy"),
    intVal: parseInt((currentYear - i).toString(), 10),
  }));
};

export const getDateOptionComponentItems = (
  selectableItems: SelectableItem[],
  key: DateComponent,
  t: TranslateFunction,
  isAlreadyTranslated = true,
): Item[] =>
  selectableItems.map((labelComponents: SelectableItem) => ({
    id: `${key}-${labelComponents.value}`,
    name: isAlreadyTranslated ? labelComponents.label : t(labelComponents.label),
    val: String(labelComponents.value)?.trim(),
    intVal: labelComponents.intVal,
  }));

export const toDOBToAgeGroupTag = (dateOfBirth: Date): AgeGateDOBGroupLabel => {
  const now = new Date(Date.now());

  const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dobUTC = new Date(
    Date.UTC(dateOfBirth.getFullYear(), dateOfBirth.getMonth(), dateOfBirth.getDate()),
  );

  let age = todayUTC.getFullYear() - dobUTC.getFullYear();
  const monthDiff = todayUTC.getMonth() - dobUTC.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && todayUTC.getDate() < dobUTC.getDate())) {
    age -= 1;
  }

  return age >= 13 ? AgeGateDOBGroupLabel.Age13AndOver : AgeGateDOBGroupLabel.AgeUnder13;
};
