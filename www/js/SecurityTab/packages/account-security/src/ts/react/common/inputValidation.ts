import type React from "react";

export type InputValidator = (value: string) => Promise<string | null>;

/**
 * Returns null (no error) for every argument.
 */
export const validateTrue: InputValidator = () => Promise.resolve(null);

/**
 * A helper function that captures [Enter] presses within input elements
 * (especially those that are not bound to forms with submit behavior).
 */
export const handleKeyDown =
  (handler: () => unknown, canSubmit: boolean) =>
  (event: React.KeyboardEvent<unknown>): void => {
    // Enter key.
    if (event.key === "Enter" && canSubmit) {
      event.preventDefault();
      event.stopPropagation();
      handler();
    }
  };

/**
 * A helper function that captures form input `onChange` events, validating the
 * input value and setting the appropriate React state variables.
 */
export const validateAndSetStateForInput =
  <T extends HTMLInputElement = HTMLInputElement>(
    lastValue: string,
    validCharactersRegEx: RegExp | undefined,
    validate: InputValidator,
    setValue: (value: string) => void,
    setError: (errorMessage: string | null) => void,
    onChangeCustom?: (value: string) => void,
  ) =>
  async (event: React.FormEvent<T>): Promise<void> => {
    let { value } = event.currentTarget;
    // Force the value back to the original value if we got invalid characters.
    if (validCharactersRegEx !== undefined && !validCharactersRegEx.test(value)) {
      value = lastValue;
    }

    if (onChangeCustom !== undefined) {
      onChangeCustom(value);
    }
    setValue(value);
    setError(await validate(value));
  };
