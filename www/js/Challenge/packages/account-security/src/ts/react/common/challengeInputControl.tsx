import React from "react";
import { TextInput } from "@rbx/foundation-ui";
import { handleKeyDown, InputValidator, validateAndSetStateForInput } from "./inputValidation";
import "../../../css/common/challengeInputControl.css";

type Props = {
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
  handleSubmit: () => unknown;
  /** Additional optional code to run on input change. */
  onChange: (value?: string) => void;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  maxLength?: number;
  validCharactersRegEx?: RegExp;
  concealInput?: boolean;
  autoFocus?: boolean;
};

/**
 * A Foundation text input with validation, for challenges. Legacy surfaces use `InputControl`.
 */
const ChallengeInputControl: React.FC<Props> = ({
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
  inputMode,
  autoComplete,
  maxLength,
  validCharactersRegEx,
  concealInput,
  autoFocus,
}: Props) => {
  const errorText = !disabled && value !== "" && error !== null ? error : null;

  return (
    <TextInput
      id={id}
      data-testid="challenge-input-control"
      size="Medium"
      type={inputType}
      inputMode={inputMode}
      autoComplete={autoComplete}
      maxLength={maxLength}
      placeholder={placeholder}
      aria-label={placeholder}
      value={value}
      isDisabled={disabled}
      hasError={errorText !== null}
      // Reserve the hint row so showing an error doesn't shift the layout.
      helperText={errorText ?? "\u00A0"}
      className={concealInput && value.length > 0 ? "challenge-input-concealed" : undefined}
      onChange={validateAndSetStateForInput(
        value, // The value prior to change.
        validCharactersRegEx,
        validate,
        setValue,
        setError,
        onChangeCustom,
      )}
      onKeyDown={handleKeyDown(handleSubmit, canSubmit)}
      autoFocus={autoFocus}
    />
  );
};

export default ChallengeInputControl;
