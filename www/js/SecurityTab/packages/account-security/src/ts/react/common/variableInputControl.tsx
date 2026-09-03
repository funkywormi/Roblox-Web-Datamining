import React, { useEffect, useState } from "react";
import { FormControl, FormGroup } from "react-style-guide";
import classNames from "classnames";
import "../../../css/common/inputFieldConcealed.scss";
import "../../../css/common/variableInputControl.scss";
import { useDebounce } from "react-utilities";
import { PhonePrefix } from "../../common/request/types/phone";
import { InputValidator } from "./inputControl";

const phoneNumberCharactersRegex = /^[\d-()]+$/;

/**
 * A helper function that captures [Enter] presses within input elements
 * (especially those that are not bound to forms with submit behavior).
 */
const handleKeyDown =
  (handler: () => void | Promise<void>, canSubmit: boolean) =>
  async (event: React.KeyboardEvent<unknown>): Promise<void> => {
    // Enter key.
    if (event.key === "Enter" && canSubmit) {
      event.preventDefault();
      event.stopPropagation();
      await handler();
    }
  };

const couldBePhoneNumber = (value: string) => {
  const valueSpaceRemoved = value.replace(/\s+/g, "");
  return valueSpaceRemoved.length > 2 && phoneNumberCharactersRegex.test(valueSpaceRemoved);
};

/**
 * A helper function that captures form input `onChange` events, validating the
 * input value and setting the appropriate React state variables.
 */
const setStateForInput =
  (
    lastValue: string,
    validCharactersRegEx: RegExp | undefined,
    setValue: (value: string) => void,
    togglePhonePrefixSection: (value: string) => void,
    onChangeCustom?: (value: string) => void,
  ) =>
  (event: React.FormEvent<FormControl & HTMLInputElement>): void => {
    let { value } = event.currentTarget;
    // Force the value back to the original value if we got invalid characters.
    if (validCharactersRegEx !== undefined && !validCharactersRegEx.test(value)) {
      value = lastValue;
    }

    togglePhonePrefixSection(value);
    if (onChangeCustom !== undefined) {
      onChangeCustom(value);
    }
    setValue(value);
  };

type CommonProps = {
  // Required parameters:
  id: string;
  inputType: string;
  placeholder: string;
  disabled: boolean;
  value: string;
  setValue: (value: string) => void;
  error: string | null;
  setError: (errorMessage: string | null) => void;
  validate: InputValidator;
  canSubmit: boolean;
  handleSubmit: () => void | Promise<void>;
  /** Additional optional code to run on input change. */
  onChange?: (value?: string) => void;

  // Optional parameters:
  // eslint-disable-next-line react/require-default-props
  label?: string;
  // eslint-disable-next-line react/require-default-props
  bottomLabel?: string | JSX.Element;
  // eslint-disable-next-line react/require-default-props
  inputMode?: FormControl.FormControlProps["inputMode"];
  // eslint-disable-next-line react/require-default-props
  autoComplete?: string;
  // eslint-disable-next-line react/require-default-props
  maxLength?: number;
  // eslint-disable-next-line react/require-default-props
  validCharactersRegEx?: RegExp;
  // eslint-disable-next-line react/require-default-props
  hideFeedback?: boolean;
  // eslint-disable-next-line react/require-default-props
  concealInput?: boolean;
  // eslint-disable-next-line react/require-default-props
  autoFocus?: boolean;
  // eslint-disable-next-line react/require-default-props
  debounceValidation?: boolean;
};

// When phoneSelectorEnabled is true, require phone-related props
type WithPhoneSelector = {
  phoneSelectorEnabled: true;
  phonePrefixIndex: number | null;
  setPhonePrefixIndex: (phonePrefixIndex: number | null) => void;
  phonePrefixList: PhonePrefix[];
  knownPhoneInput?: boolean;
};

type WithoutPhoneSelector = {
  phoneSelectorEnabled: false;
};

type Props = CommonProps & (WithPhoneSelector | WithoutPhoneSelector);

/**
 * An input control that displays a phone prefix selector if it detects that
 * the input could be a phone number.
 *
 * TODO: Allow password inputs to be toggled for visibility.
 */
const VariableInputControl: React.FC<Props> = ({
  id,
  inputType,
  placeholder,
  disabled,
  value,
  error,
  canSubmit,
  validate,
  setValue,
  setError,
  handleSubmit,

  onChange: onChangeCustom,
  label,
  bottomLabel,
  inputMode,
  autoComplete,
  maxLength,
  validCharactersRegEx,
  hideFeedback,
  concealInput,
  autoFocus,
  debounceValidation,
  ...phoneProps
}: Props) => {
  // When debouncing is enabled, only show feedback after the debounced value has been validated
  const debouncedValue = useDebounce(value, 500);
  const valueToValidate = debounceValidation ? debouncedValue : value;
  const valueHasSuccess = valueToValidate !== "" && error === null;
  const valueHasError = valueToValidate !== "" && error !== null;
  const valueHasFeedback = valueHasSuccess || valueHasError;
  // Defining displayedPhonePrefixIndex separately allows us to set phonePrefix to null when the phone
  // prefix section disappears without disrupting the animation. It also allows
  // us to track the user's last selected phonePrefix
  const [displayedPhonePrefixIndex, setDisplayedPhonePrefixIndex] = useState(
    (phoneProps.phoneSelectorEnabled && phoneProps.phonePrefixIndex) || 0,
  );
  // If we know it's a phone input up front don't worry about testing the value. Defaults to false.
  const [shouldShowPhonePrefixSection, setShouldShowPhonePrefixSection] = useState(
    (phoneProps.phoneSelectorEnabled && couldBePhoneNumber(value)) ||
      (phoneProps.phoneSelectorEnabled && phoneProps.knownPhoneInput),
  );

  useEffect(() => {
    const validateAndSetError = async () => {
      setError(await validate(valueToValidate));
    };
    // eslint-disable-next-line no-void
    void validateAndSetError();
  }, [valueToValidate, validate, setError, debounceValidation]);

  const togglePhonePrefixSection = (valueToCheck: string) => {
    // Avoid accidentally setting prefix list to true if it's disabled.
    if (!phoneProps.phoneSelectorEnabled) {
      return;
    }
    // Avoid accidentally setting prefix list to false if it's known it's a phone input.
    if (phoneProps.knownPhoneInput) {
      phoneProps.setPhonePrefixIndex(displayedPhonePrefixIndex);
      return;
    }
    if (couldBePhoneNumber(valueToCheck)) {
      phoneProps.setPhonePrefixIndex(displayedPhonePrefixIndex);
      setShouldShowPhonePrefixSection(true);
    } else {
      phoneProps.setPhonePrefixIndex(null);
      setShouldShowPhonePrefixSection(false);
    }
  };

  const phoneSectionClasses = classNames("phone-prefix-section", {
    visible: shouldShowPhonePrefixSection && phoneProps.phoneSelectorEnabled,
  });
  const inputClasses = classNames("identifier-input", {
    "input-field-concealed": concealInput && value.length > 0,
  });
  const optionStr = (localizedName: string, prefix: string) => `${localizedName} +(${prefix})`;
  const prefixStr = (prefixIndex: number, phonePrefixList: PhonePrefix[]) => {
    const prefix = phonePrefixList[prefixIndex]?.prefix ?? "";
    const countryCode = phonePrefixList[prefixIndex]?.code ?? "";
    return `${countryCode} +${prefix}`;
  };

  const getInputForm = () => {
    return (
      <div className="input-field form-control recovery-input">
        <div className="input-row">
          {phoneProps.phoneSelectorEnabled && (
            <div className={phoneSectionClasses}>
              <span className="phone-prefix-wrapper">
                <span className="select-preview">
                  {prefixStr(displayedPhonePrefixIndex, phoneProps.phonePrefixList)}
                </span>
                <select
                  className="phone-prefix-dropdown rbx-select"
                  onChange={e => {
                    const targetIndex = Number(e.target.value);
                    setDisplayedPhonePrefixIndex(targetIndex);
                    phoneProps.setPhonePrefixIndex(targetIndex);
                  }}
                  value={displayedPhonePrefixIndex}
                >
                  {phoneProps.phonePrefixList.map((option, index) => (
                    <option className="prefix-option" value={index} key={option.prefix}>
                      {optionStr(option.localizedName, option.prefix)}
                    </option>
                  ))}
                </select>
              </span>
              <div id="phonenumber-divider" className="phone-divider" />
            </div>
          )}
          <FormControl
            as="input"
            className={inputClasses}
            type={inputType}
            inputMode={inputMode}
            autoComplete={autoComplete}
            maxLength={maxLength}
            disabled={disabled}
            value={value}
            placeholder={placeholder}
            onChange={setStateForInput(
              value, // The value prior to change.
              validCharactersRegEx,
              setValue,
              togglePhonePrefixSection,
              onChangeCustom,
            )}
            onKeyDown={handleKeyDown(handleSubmit, canSubmit) as any}
            autoFocus={autoFocus}
            spellCheck={false}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="input-control-wrapper">
      {label && (
        <label className="text-body-small" htmlFor={id}>
          {label}
        </label>
      )}
      <FormGroup
        controlId={id}
        className={`${valueHasFeedback ? "form-has-feedback" : ""} ${
          valueHasSuccess ? "form-has-success" : ""
        } ${valueHasError ? "form-has-error" : ""}`}
      >
        {getInputForm()}
        {!disabled && !hideFeedback && valueHasSuccess && <span className="icon-checkmark-on" />}
        {!disabled && !hideFeedback && valueHasError && <span className="icon-close" />}
        {/* Prevent reflow of elements when we get an error. */}
        <div className="form-control-label bottom-label xsmall error-text">
          {!disabled && valueHasError ? error : bottomLabel || "\u00A0"}
        </div>
      </FormGroup>
    </div>
  );
};

export default VariableInputControl;
