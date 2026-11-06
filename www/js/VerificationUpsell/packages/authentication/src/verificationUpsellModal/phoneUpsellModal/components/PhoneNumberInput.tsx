import React, { useEffect, useState } from "react";
import type { Translator } from "@rbx/www-common/i18n";
import { TextInput } from "@rbx/foundation-ui";
import { phoneUpsellStrings } from "../../common/constants/translationConstants";
import { getPhonePrefixes } from "../services/phoneService";
import usePhoneUpsellState from "../hooks/usePhoneUpsellState";
import { SET_COUNTRY, SET_PHONE_NUMBER, SET_PREFIX_OPTIONS_LIST } from "../actions/actionTypes";
import { phoneSubmissionConstants, phoneNumberA11yInputLabels } from "../constants/phoneConstants";
import getSectionValueForPage from "../utils/loggingUtils";
import events from "../constants/phoneVerificationEventStreamConstants";
import { sendVerificationUpsellEvent } from "../../common/utils/loggingUtils";

function PhoneNumberInput({ translate }: { translate: Translator<"Feature.VerificationUpsell"> }) {
  const { phoneUpsellState, dispatch } = usePhoneUpsellState();
  const { prefixStr, optionStr } = phoneSubmissionConstants;
  const { phone, phonePrefixPickerIndex, phonePrefixOptionsList, pageName, origin } =
    phoneUpsellState;
  const { PhoneNumberInputId } = phoneNumberA11yInputLabels;

  const section = getSectionValueForPage(pageName);

  useEffect(() => {
    async function populatePhonephonePrefixOptionsList() {
      let options = phonePrefixOptionsList;
      if (phonePrefixOptionsList.length === 0) {
        options = await getPhonePrefixes();
        dispatch({
          type: SET_PREFIX_OPTIONS_LIST,
          phonePrefixOptionsList: options,
        });
      }
    }
    populatePhonephonePrefixOptionsList();
  }, []);

  const handlePickPhonePrefix = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRowIndex = Number(e.target.value);
    dispatch({
      type: SET_COUNTRY,
      phonePrefixPickerIndex: selectedRowIndex,
    });
  };
  const prefix = phonePrefixOptionsList?.[phonePrefixPickerIndex]?.prefix ?? "";

  const handlePhonePrefixFocus = () => {
    sendVerificationUpsellEvent(events.addPhonePrefixPressed, {
      origin,
      section,
    });
  };

  const handlePhoneNumberInputFocus = () => {
    sendVerificationUpsellEvent(events.addPhonePhoneNumberPressed, {
      origin,
      section,
    });
  };

  return (
    <div>
      <label
        htmlFor={PhoneNumberInputId}
        className="phone-upsell-label text-body-small content-default"
      >
        {translate(phoneUpsellStrings.LabelPhoneNumber)}
      </label>
      <TextInput
        id={PhoneNumberInputId}
        size="Medium"
        type="tel"
        value={phone}
        placeholder={translate(phoneUpsellStrings.LabelPhoneNumber)}
        autoComplete="tel-national"
        onChange={event =>
          dispatch({
            type: SET_PHONE_NUMBER,
            phone: event.target.value,
          })
        }
        onFocus={handlePhoneNumberInputFocus}
        leadingIconNode={
          <span
            id="upsell-phonenumber"
            className="phone-upsell-prefix flex items-center justify-end gap-small"
          >
            <span className="phone-upsell-prefix-text text-body-medium content-emphasis">
              {prefixStr(prefix)}
            </span>
            <select
              className="phone-upsell-prefix-select"
              onChange={e => handlePickPhonePrefix(e)}
              onFocus={handlePhonePrefixFocus}
              value={phonePrefixPickerIndex}
            >
              {phonePrefixOptionsList.map((option, key) => (
                <option key={`${option.code}-${option.prefix}`} value={key}>
                  {optionStr(option.localizedName, option.prefix)}
                </option>
              ))}
            </select>
            <span id="upsell-phonenumber-divider" className="phone-upsell-prefix-divider" />
          </span>
        }
      />
    </div>
  );
}

export default PhoneNumberInput;
