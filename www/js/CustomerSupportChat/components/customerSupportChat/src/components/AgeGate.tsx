import React, { useState, useMemo, useCallback, useContext } from "react";
import { WithTranslationsProps, withTranslations } from "@rbx/core-scripts/legacy/react-utilities";
import {
  defaultDOBComponents,
  maxAgeGateAge,
  maxNumberOfDates,
  monthLabels,
} from "../core/constants/ageGateConstants";
import { supportChatTranslationConfig } from "../app.config";
import DropdownMenu from "./common/dropdown/DropdownMenu";
import {
  DateComponent,
  DateComponentSelector,
  DateSelectorError,
  SelectableItem,
} from "../core/types/ageGate";
import { Item, SelectedItems, SupportContextKey } from "../core/types/common";
import { SupportContext } from "../providers/SupportContextProvider";
import {
  getDateOfBirthEntryErrors,
  getDateOptionComponentItems,
  getDayOptions,
  getYearOptions,
} from "../core/helpers/ageGateHelper";

const AgeGate: React.FC<WithTranslationsProps> = ({ translate, intl }) => {
  const [selectedItems, setSelectedItems] =
    useState<SelectedItems<DateComponent>>(defaultDOBComponents);
  const [error, setError] = useState<DateSelectorError>(defaultDOBComponents);

  const dayOptions = useMemo(
    () => getDayOptions(maxNumberOfDates, intl, translate),
    [intl, translate],
  );

  const yearOptions = useMemo(() => getYearOptions(maxAgeGateAge, intl), [intl]);

  const getSelectableDateComponentItems = useCallback(
    (selectableItems: SelectableItem[], key: DateComponent, isAlreadyTranslated = true): Item[] =>
      getDateOptionComponentItems(selectableItems, key, translate, isAlreadyTranslated),
    [translate],
  );

  // TODO(mhowell): Implement i18n date component ordering and formatting
  const birthdaySelectors: DateComponentSelector[] = useMemo(
    () => [
      {
        key: DateComponent.Month,
        label: translate("Heading.BirthdayMonth") || "Month",
        items: getSelectableDateComponentItems(monthLabels, DateComponent.Month, false),
      },
      {
        key: DateComponent.Day,
        label: translate("Heading.BirthdayDay") || "Day",
        items: getSelectableDateComponentItems(dayOptions, DateComponent.Day),
      },
      {
        key: DateComponent.Year,
        label: translate("Heading.BirthdayYear") || "Year",
        items: getSelectableDateComponentItems(yearOptions, DateComponent.Year),
      },
    ],
    [dayOptions, getSelectableDateComponentItems, translate, yearOptions],
  );

  const updateAgeGateForm = (item: Item, id: string) => {
    setSelectedItems(prevSelectedItems => ({
      ...prevSelectedItems,
      [id]: item,
    }));
    setError(storedError => ({ ...storedError, [id]: null, general: null }));
  };

  const { updateSupportInquiryContext } = useContext(SupportContext);
  const submitAgeGateHandler = useCallback(() => {
    const ageGateErrors = getDateOfBirthEntryErrors(selectedItems, translate);
    const hasErrors = Object.values(ageGateErrors).some(err => err);
    // If any errors exist, surface to the UI and prevent move to next step (support form submission)
    if (hasErrors) {
      setError(ageGateErrors);
      return;
    }

    // Explicit unwrap of optional since we validated in getDateOfBirthEntryErrors
    const dateOfBirth = new Date(
      selectedItems.year?.intVal ?? -1,
      selectedItems.month?.intVal ?? -1,
      selectedItems.day?.intVal ?? -1,
    );
    updateSupportInquiryContext({ [SupportContextKey.AgeGate]: dateOfBirth });
  }, [selectedItems, translate, updateSupportInquiryContext]);

  // After test session, design lead mentioned we do not want error state per component, rather a general error message at the bottom
  const ageGateSubmissionHasErrors = useMemo(() => Object.values(error).some(err => err), [error]);

  return (
    <div
      data-testid="support-form-age-gate"
      className="w-full md:w-[650px] rounded-lg px-6 py-8 space-y-4 h-fit section-content"
    >
      <p>{translate("Heading.AgeGate")}</p>
      <div className="grid grid-cols-1 gap-y-4 sm:gap-y-0 sm:grid-cols-3">
        {birthdaySelectors?.map(selector => {
          const dateComponentKey = selector.key as DateComponent;
          const errorMessage = dateComponentKey ? error[dateComponentKey]?.message : undefined;
          return (
            <DropdownMenu
              key={selector.key}
              id={selector.key}
              items={selector.items}
              label={selector.label}
              errorMessage={errorMessage}
              showErrorMessage={false}
              selectedItem={selector.items.find(
                item => item.id === selectedItems[dateComponentKey]?.id,
              )}
              setSelectedItem={updateAgeGateForm}
            />
          );
        })}
      </div>

      <div className="flex items-left justify-left mt-2">
        {ageGateSubmissionHasErrors && (
          <span className="w-full text-red-500 text-sm text-align-left">
            {Object.values(error).find(err => err)?.message}
          </span>
        )}
      </div>

      <div className="flex items-center justify-center">
        <button
          type="button"
          disabled={Object.values(error).some(err => err)}
          className="btn-primary-lg btn-full-width"
          onClick={() => {
            submitAgeGateHandler();
          }}
        >
          <span className="font-semibold">{translate("Action.Continue")}</span>
        </button>
      </div>

      <div className="flex items-center justify-center my-6">
        <span>
          {translate("Action.LogInOr")}{" "}
          <a href="/login?returnurl=%2Fsupport">
            <span className="text-blue-600 hover:text-blue-300 visited:text-purple-600">
              {translate("Action.LogIn")}
            </span>
          </a>
        </span>
      </div>
    </div>
  );
};

export default withTranslations(AgeGate, supportChatTranslationConfig);
