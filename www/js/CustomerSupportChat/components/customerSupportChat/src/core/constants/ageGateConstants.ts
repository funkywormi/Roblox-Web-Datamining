import { DateComponent } from "../types/ageGate";

const fullMonthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const monthLabels = fullMonthNames.map((fullName, index) => ({
  value: fullName.slice(0, 3),
  label: `Label.${fullName}`,
  intVal: index + 1,
}));

export const maxAgeGateAge = 100;

export const maxNumberOfDates = 31;

export const defaultDOBComponents = {
  [DateComponent.Month]: null,
  [DateComponent.Day]: null,
  [DateComponent.Year]: null,
};
