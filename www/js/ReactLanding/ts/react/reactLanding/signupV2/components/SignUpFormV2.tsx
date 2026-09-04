import React, { FormEvent, ReactNode, Ref, useEffect, useRef, useState } from 'react';
import {
  Button,
  Chip,
  Dropdown,
  IconButton,
  Menu,
  MenuItem,
  MenuSection,
  TextInput
} from '@rbx/foundation-ui';
import { Gender } from '../../../common/types/signupTypes';
import signupV2CardClassName from '../constants/signupV2Styles';
import UsernameRequirementList, { UsernameRequirementItem } from './UsernameRequirementList';
import UsernameSuggestions from './UsernameSuggestions';

// Hoisted out of the JSX because `react/jsx-no-literals` rejects bare strings there.
const requiredFieldMarker = '*';

export enum SignUpFormV2SubmissionMode {
  Passkey = 'passkey',
  Password = 'password'
}

export type SignUpFormV2BirthdayFieldName = 'day' | 'month' | 'year';

export type SignUpFormV2BirthdayOption = {
  value: string;
  title: string;
};

export type SignUpFormV2BirthdayField = {
  name: SignUpFormV2BirthdayFieldName;
  value: string;
  label: string;
  placeholder: string;
  options: ReadonlyArray<SignUpFormV2BirthdayOption>;
  onOpenChange?: (isOpen: boolean) => void;
};

export type SignUpFormV2Labels = {
  heading: string;
  subheading: string;
  birthday: string;
  username: string;
  usernamePlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  gender: string;
  female: string;
  male: string;
  continue: string;
  createAccount: string;
  showPassword: string;
  hidePassword: string;
};

type SignUpFormV2BaseProps = {
  labels: SignUpFormV2Labels;
  birthdayFields: ReadonlyArray<SignUpFormV2BirthdayField>;
  birthdayError?: string;
  username: string;
  usernameError?: string;
  usernameRequirements?: UsernameRequirementItem[];
  isUsernameErrorCoveredByRequirements?: boolean;
  usernameSuggestions?: string[];
  usernameSuggestionsLabel?: string;
  gender?: Gender;
  legalContent: ReactNode;
  /** Rendered as a function so the slot can share the form's busy state; the sign-in action
   * has to go inert while the card is submitting, like every other control in it. */
  signInContent?: (state: { isDisabled: boolean }) => ReactNode;
  generalError?: string;
  isSubmitting?: boolean;
  isSubmitDisabled?: boolean;
  cardClassName?: string;
  headingRef?: Ref<HTMLHeadingElement>;
  onBirthdayChange: (field: SignUpFormV2BirthdayFieldName, value: string) => void;
  onUsernameChange: (username: string) => void;
  onUsernameSuggestionSelect?: (username: string) => void;
  onUsernameFocus?: () => void;
  onUsernameBlur?: () => void;
  onGenderChange?: (gender: Gender) => void;
  onSubmit: () => void;
};

type SignUpFormV2PasskeyProps = SignUpFormV2BaseProps & {
  submissionMode: SignUpFormV2SubmissionMode.Passkey;
  password?: never;
  passwordError?: never;
  isPasswordVisible?: never;
  onPasswordChange?: never;
  onPasswordVisibilityToggle?: never;
  onPasswordFocus?: never;
  onPasswordBlur?: never;
};

type SignUpFormV2PasswordProps = SignUpFormV2BaseProps & {
  submissionMode: SignUpFormV2SubmissionMode.Password;
  password: string;
  passwordError?: string;
  isPasswordVisible: boolean;
  onPasswordChange: (password: string) => void;
  onPasswordVisibilityToggle: () => void;
  onPasswordFocus?: () => void;
  onPasswordBlur?: () => void;
};

export type SignUpFormV2Props = SignUpFormV2PasskeyProps | SignUpFormV2PasswordProps;

const birthdayFieldIdByName: Record<SignUpFormV2BirthdayFieldName, string> = {
  day: 'DayDropdown',
  month: 'MonthDropdown',
  year: 'YearDropdown'
};

const SignUpFormV2 = (props: SignUpFormV2Props): JSX.Element => {
  const {
    submissionMode,
    labels,
    birthdayFields,
    birthdayError,
    username,
    usernameError,
    usernameRequirements = [],
    isUsernameErrorCoveredByRequirements = false,
    usernameSuggestions = [],
    usernameSuggestionsLabel,
    gender,
    legalContent,
    signInContent,
    generalError,
    isSubmitting = false,
    isSubmitDisabled = false,
    cardClassName = signupV2CardClassName,
    headingRef,
    onBirthdayChange,
    onUsernameChange,
    onUsernameSuggestionSelect,
    onUsernameFocus,
    onUsernameBlur,
    onGenderChange,
    onSubmit
  } = props;
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const isUsernamePointerDownRef = useRef(false);
  const isUsernameBlurPendingRef = useRef(false);
  const usernameCollapseTimeoutRef = useRef<number>();

  useEffect(() => {
    const finishPointerInteraction = (): void => {
      isUsernamePointerDownRef.current = false;
      if (!isUsernameBlurPendingRef.current) {
        return;
      }

      isUsernameBlurPendingRef.current = false;
      // Wait until the click following pointerup lands before collapsing the moving content.
      usernameCollapseTimeoutRef.current = window.setTimeout(() => {
        setIsUsernameFocused(false);
      }, 0);
    };

    window.addEventListener('pointerup', finishPointerInteraction);
    window.addEventListener('pointercancel', finishPointerInteraction);
    return () => {
      window.removeEventListener('pointerup', finishPointerInteraction);
      window.removeEventListener('pointercancel', finishPointerInteraction);
      if (usernameCollapseTimeoutRef.current !== undefined) {
        window.clearTimeout(usernameCollapseTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!isSubmitting && !isSubmitDisabled) {
      onSubmit();
    }
  };

  const handleGenderChange = (nextGender: Gender): void => {
    onGenderChange?.(gender === nextGender ? Gender.unknown : nextGender);
  };

  const isUsernameRequirementListVisible = isUsernameFocused && usernameRequirements.length > 0;
  const usernameErrorText =
    isUsernameRequirementListVisible && isUsernameErrorCoveredByRequirements
      ? undefined
      : usernameError;
  const usernameRequirementsId = 'signup-v2-username-requirements';
  const usernameInputId = 'signup-username';
  const handleUsernameSuggestionSelect = (suggestion: string): void => {
    onUsernameSuggestionSelect?.(suggestion);
    document.getElementById(usernameInputId)?.focus();
  };
  const usernameDescribedBy = [
    usernameErrorText ? `${usernameInputId}-description` : undefined,
    isUsernameRequirementListVisible ? usernameRequirementsId : undefined
  ]
    .filter(Boolean)
    .join(' ');

  const submitLabel =
    submissionMode === SignUpFormV2SubmissionMode.Passkey ? labels.continue : labels.createAccount;

  let passwordInput: JSX.Element | null = null;
  if (submissionMode === SignUpFormV2SubmissionMode.Password) {
    const {
      password,
      passwordError,
      isPasswordVisible,
      onPasswordChange,
      onPasswordVisibilityToggle,
      onPasswordFocus,
      onPasswordBlur
    } = props;
    passwordInput = (
      <TextInput
        id='signup-password'
        name='signupPassword'
        type={isPasswordVisible ? 'text' : 'password'}
        size='Medium'
        label={labels.password}
        placeholder={labels.passwordPlaceholder}
        autoComplete='new-password'
        isRequired
        value={password}
        onChange={event => onPasswordChange?.(event.target.value)}
        onFocus={onPasswordFocus}
        onBlur={onPasswordBlur}
        isDisabled={isSubmitting}
        hasError={Boolean(passwordError)}
        error={passwordError}
        trailingIconNode={
          <IconButton
            type='button'
            icon={isPasswordVisible ? 'icon-regular-eye' : 'icon-regular-eye-slash'}
            ariaLabel={isPasswordVisible ? labels.hidePassword : labels.showPassword}
            size='Small'
            variant='Utility'
            isDisabled={isSubmitting}
            onClick={onPasswordVisibilityToggle}
          />
        }
      />
    );
  }

  return (
    <form
      className={`${cardClassName} gap-xlarge`}
      aria-busy={isSubmitting}
      onSubmit={handleSubmit}
      onPointerDownCapture={() => {
        isUsernamePointerDownRef.current = isUsernameRequirementListVisible;
      }}
      // `isRequired` puts the native `required` attribute on the inputs, which keeps the
      // field marked for assistive tech but would otherwise let the browser pre-empt our
      // own debounced validation with its own popup.
      noValidate
      data-testid='signup-form-v2'>
      <div className='flex width-full flex-col items-start'>
        {/* The StyleGuide gives every heading element vertical padding, which would
            otherwise push the title below the card's own inset. */}
        <h1
          ref={headingRef}
          className='content-emphasis text-heading-medium padding-y-none margin-bottom-[4px]'
          tabIndex={-1}>
          {labels.heading}
        </h1>
        <p className='content-default text-body-medium'>{labels.subheading}</p>
      </div>

      <div className='flex width-full flex-col items-center gap-[20px]'>
        <div className='flex width-full flex-col gap-large'>
          <div
            role='group'
            aria-labelledby='signup-v2-birthday-label'
            aria-describedby={birthdayError ? 'signup-v2-birthday-error' : undefined}>
            <span
              id='signup-v2-birthday-label'
              className='content-emphasis text-title-medium padding-bottom-small block'>
              {labels.birthday}{' '}
              {/* Birthday is a Dropdown group rather than a Foundation field, so it has
                  to reproduce the marker TextInput renders for `isRequired`.
                  TODO: validate with RTL languages https://roblox.atlassian.net/browse/AA-7421 */}
              <span className='content-default'>{requiredFieldMarker}</span>
            </span>
            <div className='flex width-full gap-small'>
              {birthdayFields.map(field => (
                <div
                  id={birthdayFieldIdByName[field.name]}
                  className='min-width-0 grow-1 basis-0'
                  key={field.name}
                  data-testid={`birthday-${field.name}`}>
                  <Dropdown
                    size='Medium'
                    value={field.value || undefined}
                    placeholder={field.placeholder}
                    ariaLabel={field.label}
                    isDisabled={isSubmitting}
                    hasError={Boolean(birthdayError)}
                    onValueChange={value => onBirthdayChange(field.name, value)}
                    onOpenChange={field.onOpenChange}>
                    <Menu>
                      <MenuSection>
                        {field.options.map(option => (
                          <MenuItem key={option.value} value={option.value} title={option.title} />
                        ))}
                      </MenuSection>
                    </Menu>
                  </Dropdown>
                </div>
              ))}
            </div>
            {birthdayError && (
              <span
                id='signup-v2-birthday-error'
                className='content-system-alert text-caption-small padding-top-small block'
                aria-live='polite'>
                {birthdayError}
              </span>
            )}
          </div>

          <div className='flex width-full flex-col gap-small'>
            <TextInput
              id={usernameInputId}
              name='signupUsername'
              type='text'
              size='Medium'
              label={labels.username}
              placeholder={labels.usernamePlaceholder}
              autoComplete='username'
              isRequired
              value={username}
              onChange={event => onUsernameChange(event.target.value)}
              onFocus={() => {
                if (usernameCollapseTimeoutRef.current !== undefined) {
                  window.clearTimeout(usernameCollapseTimeoutRef.current);
                  usernameCollapseTimeoutRef.current = undefined;
                }
                isUsernameBlurPendingRef.current = false;
                setIsUsernameFocused(true);
                onUsernameFocus?.();
              }}
              onBlur={() => {
                if (isUsernamePointerDownRef.current) {
                  isUsernameBlurPendingRef.current = true;
                } else {
                  setIsUsernameFocused(false);
                }
                onUsernameBlur?.();
              }}
              isDisabled={isSubmitting}
              hasError={Boolean(usernameError)}
              error={usernameErrorText}
              aria-describedby={usernameDescribedBy || undefined}
            />
            {isUsernameRequirementListVisible && (
              <UsernameRequirementList
                id={usernameRequirementsId}
                requirements={usernameRequirements}
                hasEnteredUsername={Boolean(username)}
              />
            )}
            {usernameSuggestionsLabel && onUsernameSuggestionSelect && (
              <UsernameSuggestions
                label={usernameSuggestionsLabel}
                suggestions={usernameSuggestions}
                isDisabled={isSubmitting}
                onSelect={handleUsernameSuggestionSelect}
              />
            )}
          </div>

          {passwordInput}

          {onGenderChange && (
            <div className='width-[212px]' role='group' aria-labelledby='signup-v2-gender-label'>
              {/* Legacy `.dark-theme p` outranks Foundation content tokens, so this label
                  uses `span` to keep its color. */}
              <span
                id='signup-v2-gender-label'
                className='content-emphasis text-title-medium padding-bottom-small block'>
                {labels.gender}
              </span>
              <div className='flex gap-small'>
                <Chip
                  text={labels.female}
                  size='Medium'
                  variant='Standard'
                  leadingIconName='icon-regular-head-female'
                  isChecked={gender === Gender.female}
                  isDisabled={isSubmitting}
                  onCheckedChange={isChecked =>
                    handleGenderChange(isChecked ? Gender.female : Gender.unknown)
                  }
                />
                <Chip
                  text={labels.male}
                  size='Medium'
                  variant='Standard'
                  leadingIconName='icon-regular-head-male'
                  isChecked={gender === Gender.male}
                  isDisabled={isSubmitting}
                  onCheckedChange={isChecked =>
                    handleGenderChange(isChecked ? Gender.male : Gender.unknown)
                  }
                />
              </div>
            </div>
          )}
        </div>

        <div className='flex width-full flex-col items-center gap-small'>
          {generalError && (
            <span className='content-system-alert text-body-small text-align-x-center' role='alert'>
              {generalError}
            </span>
          )}

          <Button
            className='width-full'
            type='submit'
            size='Medium'
            variant='Emphasis'
            isDisabled={isSubmitting || isSubmitDisabled}
            isLoading={isSubmitting}
            aria-label={submitLabel}
            aria-busy={isSubmitting}>
            {submitLabel}
          </Button>

          {signInContent?.({ isDisabled: isSubmitting })}

          <div className='content-muted width-full text-caption-small [&_a]:underline'>
            {legalContent}
          </div>
        </div>
      </div>
    </form>
  );
};

export default SignUpFormV2;
