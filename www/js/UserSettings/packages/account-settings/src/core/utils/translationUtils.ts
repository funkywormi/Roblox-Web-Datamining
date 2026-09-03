import { TranslateFunction } from "react-utilities";
import { TDropdownOption } from "../../types/commonTypes";

export const translateDropdownOptions = (
  translate: TranslateFunction,
  options: TDropdownOption[],
): TDropdownOption[] => {
  const translatedOptions = options.map(option => {
    // Dropdown values could be many different types
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { key: option.key, label: translate(option.label), value: option.value };
  });
  return translatedOptions;
};

export default translateDropdownOptions;
