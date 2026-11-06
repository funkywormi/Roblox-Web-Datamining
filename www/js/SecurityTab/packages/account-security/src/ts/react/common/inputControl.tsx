import React from "react";
import { FormControl, FormGroup } from "react-style-guide";
import "../../../css/common/inputFieldConcealed.css";
import {
  handleKeyDown,
  InputValidator,
  validateAndSetStateForInput,
  validateChained,
  validateEquals,
  validateTrue,
} from "./inputValidation";

export type { InputValidator };
export { validateChained, validateEquals, validateTrue };

/**
 * Returns true if the value looks like an email address.
 */
export const isValidEmail = (value: string): boolean => /\S+@\S+\.\S+/.test(value);

/**
 * Returns null (no error) if the argument looks like an email address.
 */
export const validateEmailAddress =
  (errorMessage: string): InputValidator =>
  async (value: string) => {
    if (isValidEmail(value)) {
      return Promise.resolve(null);
    }

    return Promise.resolve(errorMessage);
  };

type Props = {
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
  onChange: (value?: string) => void;

  // Optional parameters:
  // eslint-disable-next-line react/require-default-props
  label?: string;
  // eslint-disable-next-line react/require-default-props
  bottomLabel?: string | React.ReactElement;
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
};

/**
 * An input control that encapsulates Roblox-styled inputs with labels and
 * error validation.
 *
 * TODO: Allow password inputs to be toggled for visibility.
 */
const InputControl: React.FC<Props> = ({
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
}: Props) => {
  const valueHasSuccess = value !== "" && error === null;
  const valueHasError = value !== "" && error !== null;
  const valueHasFeedback = valueHasSuccess || valueHasError;

  return (
    <div className="input-control-wrapper">
      {label && (
        <label className="text-label xsmall" htmlFor={id}>
          {label}
        </label>
      )}
      <FormGroup
        controlId={id}
        className={`${valueHasFeedback ? "form-has-feedback" : ""} ${
          valueHasSuccess ? "form-has-success" : ""
        } ${valueHasError ? "form-has-error" : ""}`}
      >
        <FormControl
          as="input"
          className={`input-field${
            concealInput && value.length > 0 ? " input-field-concealed" : ""
          }`}
          type={inputType}
          inputMode={inputMode}
          autoComplete={autoComplete}
          maxLength={maxLength}
          disabled={disabled}
          value={value}
          placeholder={placeholder}
          onChange={validateAndSetStateForInput<FormControl & HTMLInputElement>(
            value, // The value prior to change.
            validCharactersRegEx,
            validate,
            setValue,
            setError,
            onChangeCustom,
          )}
          onKeyDown={handleKeyDown(handleSubmit, canSubmit) as any}
          autoFocus={autoFocus}
        />
        {!disabled && !hideFeedback && valueHasSuccess && <span className="icon-checkmark-on" />}
        {!disabled && !hideFeedback && valueHasError && <span className="icon-close" />}
        {/* Prevent reflow of elements when we get an error. */}
        <div className="form-control-label bottom-label xsmall">
          {!disabled && valueHasError ? error : bottomLabel || "\u00A0"}
        </div>
      </FormGroup>
    </div>
  );
};

export default InputControl;
