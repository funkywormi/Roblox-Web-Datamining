import { forwardRef, useEffect, useRef, useState } from "react";
import { TextInput, TTextInputProps } from "@rbx/foundation-ui";
import {
  signupUsernameMaxLength,
  loginUsernameMaxLength,
  usernameMinLength,
} from "../constants/signupConstants";
import UsernameRequirementList, { UsernameRequirementItem } from "./UsernameRequirementList";

export type UsernameInputProps = {
  reserveErrorSpace?: boolean;
  isSignup?: boolean;
  /** Shown below the input while it is focused, like the SignUpV2 username checklist. */
  requirements?: UsernameRequirementItem[];
  /** Hides `error` while the requirements are shown, when they already explain it. */
  isErrorCoveredByRequirements?: boolean;
  onChange: (value: string) => void;
} & Omit<
  TTextInputProps,
  "onChange" | "leadingIconName" | "leadingIconNode" | "trailingIconName" | "trailingIconNode"
>;

let nextInputId = 0;

const UsernameInput = forwardRef<HTMLInputElement, UsernameInputProps>(
  (
    {
      reserveErrorSpace = true,
      isSignup = true,
      requirements = [],
      isErrorCoveredByRequirements = false,
      onChange,
      ...props
    },
    ref,
  ) => {
    const maxLength = isSignup ? signupUsernameMaxLength : loginUsernameMaxLength;
    const fallbackIdRef = useRef<string>();
    if (fallbackIdRef.current === undefined) {
      nextInputId += 1;
      fallbackIdRef.current = `username-input-${nextInputId}`;
    }
    const inputId = props.id ?? fallbackIdRef.current;
    const requirementsId = `${inputId}-requirements`;

    const [isFocused, setIsFocused] = useState(false);
    const isPointerDownRef = useRef(false);
    const isBlurPendingRef = useRef(false);
    const collapseTimeoutRef = useRef<number>();
    const hasRequirements = requirements.length > 0;

    // Clicking below the input (for example, the submit button) blurs it on pointerdown.
    // Collapsing the list right then would move that target before the click lands, so the
    // collapse waits for the pointer to come back up, as in SignUpFormV2.
    useEffect(() => {
      if (!hasRequirements) {
        return undefined;
      }
      const startPointerInteraction = (): void => {
        isPointerDownRef.current = true;
      };
      const finishPointerInteraction = (): void => {
        isPointerDownRef.current = false;
        if (!isBlurPendingRef.current) {
          return;
        }
        isBlurPendingRef.current = false;
        collapseTimeoutRef.current = window.setTimeout(() => {
          setIsFocused(false);
        }, 0);
      };

      window.addEventListener("pointerdown", startPointerInteraction, true);
      window.addEventListener("pointerup", finishPointerInteraction);
      window.addEventListener("pointercancel", finishPointerInteraction);
      return () => {
        window.removeEventListener("pointerdown", startPointerInteraction, true);
        window.removeEventListener("pointerup", finishPointerInteraction);
        window.removeEventListener("pointercancel", finishPointerInteraction);
        if (collapseTimeoutRef.current !== undefined) {
          window.clearTimeout(collapseTimeoutRef.current);
        }
      };
    }, [hasRequirements]);

    const isRequirementListVisible = isFocused && hasRequirements;
    const errorText =
      isRequirementListVisible && isErrorCoveredByRequirements ? undefined : props.error;
    const describedBy = [
      errorText || props.helperText ? `${inputId}-description` : undefined,
      isRequirementListVisible ? requirementsId : undefined,
      props["aria-describedby"],
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="flex flex-col gap-small">
        <TextInput
          size="Medium"
          minLength={usernameMinLength}
          required
          autoComplete="username"
          {...props}
          id={inputId}
          hasError={props.hasError ?? Boolean(props.error)}
          error={errorText}
          aria-describedby={describedBy || undefined}
          maxLength={maxLength}
          ref={ref}
          onChange={e => {
            onChange(e.target.value);
          }}
          onFocus={event => {
            if (collapseTimeoutRef.current !== undefined) {
              window.clearTimeout(collapseTimeoutRef.current);
              collapseTimeoutRef.current = undefined;
            }
            isBlurPendingRef.current = false;
            setIsFocused(true);
            props.onFocus?.(event);
          }}
          onBlur={event => {
            if (isPointerDownRef.current) {
              isBlurPendingRef.current = true;
            } else {
              setIsFocused(false);
            }
            props.onBlur?.(event);
          }}
        />
        {isRequirementListVisible && (
          <UsernameRequirementList
            id={requirementsId}
            requirements={requirements}
            hasEnteredUsername={Boolean(props.value)}
          />
        )}
        {
          // Reserving vertical space to prevent layout shift when hint text appears
          reserveErrorSpace && !isRequirementListVisible && !errorText && !props.helperText ? (
            <span className="height-350" />
          ) : null
        }
      </div>
    );
  },
);

UsernameInput.displayName = "UsernameInput";

export default UsernameInput;
