import type React from "react";

export type InputValidator = (value: string) => Promise<string | null>;

/**
 * Returns null (no error) for every argument.
 */
export const validateTrue: InputValidator = () => Promise.resolve(null);

/**
 * Returns null (no error) if the argument equals some target value.
 */
export const validateEquals =
  (errorMessage: string, target: string): InputValidator =>
  async (value: string) => {
    if (value === target) {
      return Promise.resolve(null);
    }

    return Promise.resolve(errorMessage);
  };

/**
 * Returns null (no error) if all the passed input validators return null for
 * the argument (after being applied in sequence).
 */
export const validateChained =
  (...inputValidators: InputValidator[]): InputValidator =>
  async (value: string) => {
    for (let i = 0; i < inputValidators.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const errorMessage = await inputValidators[i]!(value);
      if (errorMessage !== null) {
        return errorMessage;
      }
    }

    return null;
  };

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
