import React, { useState, useEffect, useMemo } from "react";
import ClassNames from "classnames";
import { NativeDropdown } from "react-style-guide";
import { useTranslation } from "react-utilities";
import buildBirthdateDropdownOptions from "./buildBirthdateDropdownOptions";
import accountInfoTranslationConstants from "../constants/contentConstants/accountInfoTranslationConstants";
import { TUserBirthdate } from "../../../types/accountInformationTypes";
import birthdayUtils from "../utils/birthdayUtils";
import { minimumValidAge, ageOfMajority } from "../constants/accountInfo/accountInfoConstants";

const useChildBirthdateSelector = (
  childBirthdate: TUserBirthdate,
  birthdatePickerLowerBoundInclusive?: number,
  birthdatePickerUpperBoundInclusive?: number,
): [TUserBirthdate, JSX.Element, () => void, boolean] => {
  const { translate, intl } = useTranslation();
  const { birthdate: birthdateTranslation } = accountInfoTranslationConstants;

  const [selectedBirthdate, setSelectedBirthdate] = useState<TUserBirthdate>(
    birthdayUtils.initialBirthday,
  );
  const [errorMessage, setErrorMessage] = useState<string | undefined>(" ");
  const currentAge = useMemo(() => {
    return birthdayUtils.calculateAge(childBirthdate);
  }, [childBirthdate]);
  useEffect(() => {
    if (childBirthdate) {
      if (currentAge >= minimumValidAge) {
        setSelectedBirthdate(childBirthdate);
      }
    }
  }, []);

  const dropdownOptions = buildBirthdateDropdownOptions(
    translate,
    intl,
    selectedBirthdate,
    birthdatePickerLowerBoundInclusive ?? undefined,
    birthdatePickerUpperBoundInclusive ?? undefined,
  );

  const handleBirthdateSelection = (partName: string, value: string) => {
    const newBirthdate = { ...selectedBirthdate };
    newBirthdate[partName] = Number(value);
    setSelectedBirthdate(newBirthdate);
    if (birthdayUtils.birthdateSeletionCompleted(newBirthdate)) {
      // user has all three parts of the birthdate selected
      const validNewBirthdate = birthdayUtils.getClosestValidDay(newBirthdate);
      const isSameDate = birthdayUtils.isSelectingTheSameDate(validNewBirthdate, childBirthdate);
      const newAge = birthdayUtils.calculateAge(newBirthdate);
      // We consider new birthdate out of bounds as false birthdate
      if (
        newAge < (birthdatePickerLowerBoundInclusive ?? minimumValidAge) ||
        newAge > (birthdatePickerUpperBoundInclusive ?? ageOfMajority - 1)
      ) {
        setErrorMessage(translate(birthdateTranslation.errors.invalidBirthdateError));
      } else if (isSameDate) {
        setErrorMessage(translate(birthdateTranslation.errors.noChangeError));
      } else {
        setErrorMessage(undefined);
      }
    }
  };
  const clearSelectedBirthdate = () => {
    setSelectedBirthdate(
      childBirthdate && currentAge >= minimumValidAge
        ? childBirthdate
        : birthdayUtils.initialBirthday,
    );
    setErrorMessage(undefined);
  };
  const isBirthdayValid = !errorMessage;

  const birthdateSelector = (
    <React.Fragment>
      <div id="birthdate-dropdown" className="birthday-container form-group fake-input-lg">
        <div className="birth-day-dropdown">
          {dropdownOptions.map(option => {
            const classNames = ClassNames(option.class, "rbx-select-group date select-group");
            return (
              <NativeDropdown
                selectedItemvalue={option.currentValue as unknown as string}
                selectionItems={option.options}
                className={classNames}
                key={option.id}
                onChange={e => {
                  const { value } = e.target;
                  handleBirthdateSelection(option.name, value);
                }}
              />
            );
          })}
        </div>
      </div>
      <p className="text-error form-control-label modal-error-message">{errorMessage}</p>
    </React.Fragment>
  );

  return [selectedBirthdate, birthdateSelector, clearSelectedBirthdate, isBirthdayValid];
};

export default useChildBirthdateSelector;
