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
  label?: React.ReactNode;
  /** Shown under the input, replaced by the error when there is one. */
  bottomLabel?: React.ReactNode;
  className?: string;
  /** Shows a check or an X in the input once it has a value, like the legacy `InputControl`. */
  showFeedback?: boolean;
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
  label,
  bottomLabel,
  className,
  showFeedback = false,
}: Props) => {
  const errorText = !disabled && value !== "" && error !== null ? error : null;
  const feedbackIconName =
    showFeedback && !disabled && value !== ""
      ? error === null
        ? "icon-regular-check"
        : "icon-regular-x"
      : undefined;

  const inputProps = {
    id,
    "data-testid": "challenge-input-control",
    size: "Medium",
    label,
    type: inputType,
    inputMode,
    autoComplete,
    maxLength,
    placeholder,
    "aria-label": label === undefined ? placeholder : undefined,
    value,
    isDisabled: disabled,
    hasError: errorText !== null,
    // Reserve the hint row so showing an error doesn't shift the layout.
    helperText: errorText ?? bottomLabel ?? "\u00A0",
    // 16px text: legacy size, and iOS Safari zooms on focus below it.
    className: [
      "[&_input::placeholder]:text-body-large [&_input]:text-body-large",
      concealInput && value.length > 0 ? "challenge-input-concealed" : "",
      className ?? "",
    ].join(" "),
    onChange: validateAndSetStateForInput(
      value, // The value prior to change.
      validCharactersRegEx,
      validate,
      setValue,
      setError,
      onChangeCustom,
    ),
    onKeyDown: handleKeyDown(handleSubmit, canSubmit),
    autoFocus,
  } as const;

  // Two branches because `trailingIconName` can't be passed as `undefined`.
  return feedbackIconName === undefined ? (
    <TextInput {...inputProps} />
  ) : (
    <TextInput {...inputProps} trailingIconName={feedbackIconName} />
  );
};

export default ChallengeInputControl;
