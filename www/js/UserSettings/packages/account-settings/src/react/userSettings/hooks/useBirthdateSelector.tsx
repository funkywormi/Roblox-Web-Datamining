import React, { useState, useEffect, useMemo } from "react";
import ClassNames from "classnames";
import { NativeDropdown } from "react-style-guide";
import { useTranslation } from "react-utilities";
import buildBirthdateDropdownOptions from "./buildBirthdateDropdownOptions";
import accountInfoTranslationConstants from "../constants/contentConstants/accountInfoTranslationConstants";
import { TUserBirthdate } from "../../../types/accountInformationTypes";
import { useGetBirthdateQuery } from "../../apis/usersApi";
import { useGetVerifiedAgeQuery } from "../../apis/ageVerificationApi";
import { useGetAccountInfoQuery } from "../../apis/legacyAccountSettingsApi";
import birthdayUtils from "../utils/birthdayUtils";
import accountInfoEventService from "../services/eventServices/accountInfoEventService";
import { maximumValidAge, minimumValidAge } from "../constants/accountInfo/accountInfoConstants";
import { useGetSettingsUiPolicyQuery } from "../../apis/universalAppConfigurationApi";

const useBirthdateSelector = (): [TUserBirthdate, JSX.Element, () => void, boolean] => {
  const { data: birthdate } = useGetBirthdateQuery();
  const { data: verifiedAge } = useGetVerifiedAgeQuery();
  const { data: accountInfo } = useGetAccountInfoQuery();
  const { data: settingsUiPolicy } = useGetSettingsUiPolicyQuery();

  const { translate, intl } = useTranslation();
  const { birthdate: birthdateTranslation } = accountInfoTranslationConstants;

  const [selectedBirthdate, setSelectedBirthdate] = useState<TUserBirthdate>(
    birthdayUtils.initialBirthday,
  );
  const [errorMessage, setErrorMessage] = useState<string | undefined>(" ");
  const currentAge = useMemo(() => {
    return birthdayUtils.calculateAge(birthdate);
  }, [birthdate]);

  useEffect(() => {
    if (birthdate) {
      if (currentAge >= minimumValidAge) {
        setSelectedBirthdate(birthdate);
      }
    }
  }, [birthdate]);

  const dropdownOptions = buildBirthdateDropdownOptions(
    translate,
    intl,
    selectedBirthdate,
    settingsUiPolicy?.birthdatePickerLowerBoundInclusive,
    settingsUiPolicy?.birthdatePickerUpperBoundInclusive,
  );

  const handleBirthdateSelection = (partName: string, value: string) => {
    const newBirthdate = { ...selectedBirthdate };
    newBirthdate[partName] = Number(value);
    setSelectedBirthdate(newBirthdate);

    if (birthdayUtils.birthdateSeletionCompleted(newBirthdate)) {
      // user has all three parts of the birthdate selected
      const validNewBirthdate = birthdayUtils.getClosestValidDay(newBirthdate);
      const isSameDate = birthdayUtils.isSelectingTheSameDate(validNewBirthdate, birthdate);
      const newAge = birthdayUtils.calculateAge(newBirthdate);
      // We consider new age out of bound as false birthdate
      if (
        newAge < (settingsUiPolicy?.birthdatePickerLowerBoundInclusive ?? minimumValidAge) ||
        newAge > (settingsUiPolicy?.birthdatePickerUpperBoundInclusive ?? maximumValidAge)
      ) {
        setErrorMessage(translate(birthdateTranslation.errors.invalidBirthdateError));
        accountInfoEventService.birthdayUpdateModalError(
          verifiedAge?.isVerified ?? false,
          accountInfo?.UserAbove13 ?? false,
          birthdateTranslation.errors.invalidBirthdateError,
        );
      } else if (isSameDate) {
        setErrorMessage(translate(birthdateTranslation.errors.noChangeError));
        accountInfoEventService.birthdayUpdateModalError(
          verifiedAge?.isVerified ?? false,
          accountInfo?.UserAbove13 ?? false,
          birthdateTranslation.errors.noChangeError,
        );
      } else {
        setErrorMessage(undefined);
      }
    }
  };
  const clearSelectedBirthdate = () => {
    setSelectedBirthdate(
      birthdate &&
        currentAge >= (settingsUiPolicy?.birthdatePickerLowerBoundInclusive ?? minimumValidAge) &&
        currentAge <= (settingsUiPolicy?.birthdatePickerUpperBoundInclusive ?? maximumValidAge)
        ? birthdate
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
                  accountInfoEventService.birthdayUpdateModalInteration(
                    verifiedAge?.isVerified ?? false,
                    accountInfo?.UserAbove13 ?? false,
                  );
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

export default useBirthdateSelector;
