/**
 * A fixed-length code field drawn as one box per character.
 *
 * The boxes are presentational. A single transparent input is stretched over the whole row and owns
 * focus, the text cursor and the value, so the field keeps native text-entry behaviour — paste, undo
 * and the mobile numeric keypad — that per-box inputs lose.
 */

import React, { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import classNames from "classnames";

const DEFAULT_LENGTH = 6;

/** What each type rejects. Anything matching is stripped as it is typed or pasted. */
const DISALLOWED = {
  digitsOnly: /[^0-9]/g,
  alphaNumeric: /[^0-9a-zA-Z]/g,
};

export type CodeInputType = keyof typeof DISALLOWED;

let instanceCount = 0;

export interface CodeInputProps {
  /** Characters entered so far. Anything `inputType` rejects is stripped before `onChange`. */
  value: string;
  onChange: (value: string) => void;
  /** Called when the field fills up, alongside the `onChange` that completed it. */
  onComplete?: (value: string) => void;
  /** Which characters the field accepts. Also picks the mobile keyboard. */
  inputType?: CodeInputType;
  /** All strings are rendered exactly as given; copy must be translated before being passed in as input */
  label: ReactNode;
  /** Both are required to offer the reveal toggle. Without them, the code stays visible. Must be pre-translated. */
  showLabel?: ReactNode;
  hideLabel?: ReactNode;
  /** Shown below the boxes in the alert colour. An empty string counts as no error. Must be pre-translated. */
  error?: ReactNode;
  length?: number;
  disabled?: boolean;
}

export const CodeInput = ({
  value,
  onChange,
  onComplete,
  inputType = "digitsOnly",
  label,
  showLabel,
  hideLabel,
  error,
  length = DEFAULT_LENGTH,
  disabled = false,
}: CodeInputProps): React.JSX.Element => {
  const [inputId] = useState(() => {
    instanceCount += 1;
    return `code-input-${instanceCount}`;
  });
  const messageId = `${inputId}-message`;

  const [isRevealed, setIsRevealed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const accepted = event.target.value.replace(DISALLOWED[inputType], "");
      onChange(accepted);
      if (accepted.length === length) {
        onComplete?.(accepted);
      }
    },
    [length, onChange, onComplete, inputType],
  );

  const pinTextCursorToEnd = useCallback(() => {
    const field = inputRef.current;
    if (field == null) {
      return;
    }
    const end = field.value.length;
    if (field.selectionStart !== end || field.selectionEnd !== end) {
      field.setSelectionRange(end, end);
    }
  }, []);

  /**
   * Ensures that the location of the highlighted box matches the location of the cursor in the
   * hidden text input
   */
  useEffect(() => {
    const onSelectionChange = (): void => {
      if (document.activeElement === inputRef.current) {
        pinTextCursorToEnd();
      }
    };
    document.addEventListener("selectionchange", onSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", onSelectionChange);
    };
  }, [pinTextCursorToEnd]);

  const toggleReveal = useCallback(() => {
    setIsRevealed(revealed => !revealed);
  }, []);

  const canReveal = showLabel !== undefined && hideLabel !== undefined;
  const isMasked = canReveal && !isRevealed;
  const errorContent = error == null || error === "" ? undefined : error;

  return (
    <div className="flex flex-col">
      <div className="gap-xsmall padding-bottom-small flex items-center justify-between">
        <label htmlFor={inputId} className="text-title-medium content-emphasis">
          {label}
        </label>
        {canReveal ? (
          <button
            type="button"
            className="text-title-medium content-default bg-none stroke-none padding-none cursor-pointer"
            onClick={toggleReveal}
            disabled={disabled}
          >
            {isRevealed ? hideLabel : showLabel}
          </button>
        ) : null}
      </div>

      <div
        // Codes read left to right in every locale, so the row must not mirror in an RTL one.
        dir="ltr"
        data-testid="code-input-boxes"
        className="gap-medium relative flex"
      >
        {Array.from({ length }, (_, index) => {
          const character = value[index] ?? "";
          const isNext = isFocused && index === value.length;

          return (
            <div
              key={`${inputId}-box-${index}`}
              aria-hidden="true"
              data-testid="code-input-box"
              className={classNames(
                "aspect-3-4 radius-medium bg-shift-200 stroke-thick flex basis-0 grow-1 items-center justify-center",
                // Stands in for the text cursor, which is invisible along with its input.
                isNext ? "stroke-system-emphasis" : "[border-color:transparent]",
              )}
            >
              {character === "" ? null : isMasked ? (
                <span className="size-200 radius-circle bg-system-contrast" />
              ) : (
                <span className="text-heading-medium content-emphasis">{character}</span>
              )}
            </div>
          );
        })}
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          inputMode={inputType === "digitsOnly" ? "numeric" : "text"}
          autoComplete="off"
          // stops common password managers from registering this as a field for credentials
          data-1p-ignore
          data-lpignore="true"
          data-form-type="other"
          maxLength={length}
          value={value}
          disabled={disabled}
          onChange={handleChange}
          onFocus={() => {
            setIsFocused(true);
            pinTextCursorToEnd();
          }}
          onBlur={() => {
            setIsFocused(false);
          }}
          aria-describedby={errorContent === undefined ? undefined : messageId}
          aria-invalid={errorContent === undefined ? undefined : true}
          // Opacity rather than `hidden`, so the field stays focusable and keeps its place in the
          // row while the boxes above draw what was typed.
          className="absolute [inset:0] [opacity:0]"
        />
      </div>

      {errorContent === undefined ? null : (
        <div
          id={messageId}
          role="alert"
          className="text-body-small padding-top-small margin-none content-system-alert"
        >
          {errorContent}
        </div>
      )}
    </div>
  );
};

export default CodeInput;
