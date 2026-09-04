export enum InputMethod {
  Pasted = 'pasted',
  Autofilled = 'autofilled'
}

/**
 * Detects how a value was entered into an input field by inspecting native
 * InputEvent properties. Password managers and browser autofill inject values
 * without setting standard InputEvent fields, which distinguishes them from
 * keyboard input and clipboard paste.
 *
 * Returns null for standard keyboard input (typed), since only non-trivial
 * input methods are worth tracking.
 */
export const detectInputMethod = (event: Event): InputMethod | null => {
  const inputEvent = event as InputEvent;

  if (inputEvent.inputType === 'insertFromPaste' || inputEvent.inputType === 'insertFromDrop') {
    return InputMethod.Pasted;
  }

  // Firefox password managers/autofill use 'insertReplacementText' and set
  // data to the full field value in a single event.
  if (inputEvent.inputType === 'insertReplacementText') {
    return InputMethod.Autofilled;
  }

  // Chrome/Safari password managers fire an input event with all standard
  // InputEvent properties undefined.
  const target = event.target as HTMLInputElement;
  if (
    target?.value !== '' &&
    inputEvent.inputType === undefined &&
    inputEvent.data === undefined &&
    inputEvent.isComposing === undefined
  ) {
    return InputMethod.Autofilled;
  }

  return null;
};
