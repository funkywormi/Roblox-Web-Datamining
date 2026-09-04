import React, { FormEvent, Ref, useState } from 'react';
import { Button, Divider, IconButton, TextInput } from '@rbx/foundation-ui';
import signupV2CardClassName from '../constants/signupV2Styles';
import PasswordRequirementList, { PasswordRequirementItem } from './PasswordRequirementList';

export enum AddAuthMethodLayout {
  PasswordFirst = 'passwordFirst',
  PasskeyFirst = 'passkeyFirst'
}

export type AddAuthMethodPageLabels = {
  back: string;
  heading: string;
  greeting: string;
  subheading: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  showPassword: string;
  hidePassword: string;
  createPassword: string;
  createPasskey: string;
  or: string;
};

export type AddAuthMethodPageProps = {
  layout: AddAuthMethodLayout;
  labels: AddAuthMethodPageLabels;
  password: string;
  isPasswordVisible?: boolean;
  passwordRequirements?: PasswordRequirementItem[];
  passwordError?: string;
  generalError?: string;
  isCreatingPassword?: boolean;
  isCreatingPasskey?: boolean;
  isPasswordSubmitDisabled?: boolean;
  isPasskeySubmitDisabled?: boolean;
  headingRef?: Ref<HTMLHeadingElement>;
  cardClassName?: string;
  onPasswordChange: (password: string) => void;
  onPasswordVisibilityToggle?: () => void;
  onPasswordBlur?: () => void;
  onCreatePassword: () => void;
  onCreatePasskey: () => void;
  onBack: () => void;
};

// Divider hardcodes `self-stretch`, pinning its zero-height box to the top of the row.
// clsx does not dedupe utilities, so only an inline style outranks it.
const centerLine = { alignSelf: 'center' } as const;

const passwordInputId = 'signup-v2-password';
const passwordRequirementsId = 'signup-v2-password-requirements';

// Blurring folds the checklist away, shifting the controls below it upwards mid-press so
// the click never lands. Holding focus keeps the layout still until it does.
const holdPasswordFocus = (event: React.MouseEvent): void => event.preventDefault();

const OrDivider = ({ label }: { label: string }): JSX.Element => (
  <div className='flex width-full items-center gap-medium' data-testid='auth-method-divider'>
    <Divider className='grow-1 basis-0' style={centerLine} aria-hidden='true' />
    <span className='content-muted text-caption-small'>{label}</span>
    <Divider className='grow-1 basis-0' style={centerLine} aria-hidden='true' />
  </div>
);

const AddAuthMethodPage = ({
  layout,
  labels,
  password,
  isPasswordVisible = false,
  passwordRequirements = [],
  passwordError,
  generalError,
  isCreatingPassword = false,
  isCreatingPasskey = false,
  isPasswordSubmitDisabled = false,
  isPasskeySubmitDisabled = false,
  headingRef,
  cardClassName = signupV2CardClassName,
  onPasswordChange,
  onPasswordVisibilityToggle,
  onPasswordBlur,
  onCreatePassword,
  onCreatePasskey,
  onBack
}: AddAuthMethodPageProps): JSX.Element => {
  const isBusy = isCreatingPassword || isCreatingPasskey;
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!isBusy && !isPasswordSubmitDisabled) {
      onCreatePassword();
    }
  };

  const isRequirementListVisible = isPasswordFocused && passwordRequirements.length > 0;
  // The checklist already names the rule that failed, so while it is up the field repeats
  // only errors no rule covers. Once it folds away the message carries the explanation.
  const hasUnmetRequirement = passwordRequirements.some(requirement => !requirement.isMet);
  const passwordErrorText =
    isRequirementListVisible && hasUnmetRequirement ? undefined : passwordError;
  const hasPasswordError = Boolean(password) && Boolean(passwordError);

  const describedBy = [
    isRequirementListVisible ? passwordRequirementsId : undefined,
    // Ours replaces Foundation's aria-describedby rather than extending it, so its own
    // error span id has to be re-listed here.
    hasPasswordError && passwordErrorText ? `${passwordInputId}-description` : undefined
  ]
    .filter(Boolean)
    .join(' ');

  const passwordSection = (
    <div className='flex width-full flex-col gap-medium' data-testid='password-auth-method'>
      <div className='flex width-full flex-col gap-small'>
        <TextInput
          id={passwordInputId}
          type={isPasswordVisible ? 'text' : 'password'}
          size='Medium'
          label={labels.passwordLabel}
          placeholder={labels.passwordPlaceholder}
          autoComplete='new-password'
          value={password}
          onChange={event => onPasswordChange(event.target.value)}
          onFocus={() => setIsPasswordFocused(true)}
          onBlur={() => {
            setIsPasswordFocused(false);
            onPasswordBlur?.();
          }}
          isDisabled={isBusy}
          hasError={hasPasswordError}
          error={hasPasswordError ? passwordErrorText : undefined}
          aria-describedby={describedBy || undefined}
          trailingIconNode={
            onPasswordVisibilityToggle && (
              <IconButton
                type='button'
                icon={isPasswordVisible ? 'icon-regular-eye' : 'icon-regular-eye-slash'}
                ariaLabel={isPasswordVisible ? labels.hidePassword : labels.showPassword}
                size='Small'
                variant='Utility'
                isDisabled={isBusy}
                onMouseDown={holdPasswordFocus}
                onClick={onPasswordVisibilityToggle}
              />
            )
          }
        />
        {isRequirementListVisible && (
          <PasswordRequirementList
            id={passwordRequirementsId}
            requirements={passwordRequirements}
            hasEnteredPassword={Boolean(password)}
          />
        )}
      </div>
      <Button
        className='width-full'
        type='submit'
        size='Medium'
        variant={layout === AddAuthMethodLayout.PasswordFirst ? 'Emphasis' : 'Standard'}
        isDisabled={isBusy || isPasswordSubmitDisabled}
        isLoading={isCreatingPassword}
        onMouseDown={holdPasswordFocus}
        aria-label={labels.createPassword}
        aria-busy={isCreatingPassword}>
        {labels.createPassword}
      </Button>
    </div>
  );

  const passkeySection = (
    <div className='width-full' data-testid='passkey-auth-method'>
      <Button
        className='width-full'
        type='button'
        size='Medium'
        variant={layout === AddAuthMethodLayout.PasskeyFirst ? 'Emphasis' : 'Standard'}
        isDisabled={isBusy || isPasskeySubmitDisabled}
        isLoading={isCreatingPasskey}
        aria-label={labels.createPasskey}
        aria-busy={isCreatingPasskey}
        onMouseDown={holdPasswordFocus}
        onClick={onCreatePasskey}>
        {labels.createPasskey}
      </Button>
    </div>
  );

  return (
    <form
      className={cardClassName}
      onSubmit={handlePasswordSubmit}
      aria-busy={isBusy}
      data-testid='add-auth-method-page'>
      <div className='flex width-full items-center gap-small'>
        <IconButton
          type='button'
          icon='icon-regular-chevron-large-left'
          ariaLabel={labels.back}
          size='Medium'
          variant='Utility'
          isDisabled={isBusy}
          onClick={onBack}
          // Pulls the glyph back to the card's content edge, past the button's own padding.
          className='margin-left-[-12px]'
        />
        {/* StyleGuide pads every heading element, pushing the title off the card's inset. */}
        <h1
          ref={headingRef}
          className='content-emphasis text-heading-medium padding-y-none'
          tabIndex={-1}>
          {labels.heading}
        </h1>
      </div>

      {/* Legacy `.dark-theme p` outranks Foundation content tokens, so this copy and the
          error below use `span` to keep their colors. */}
      <div className='flex width-full flex-col gap-xxsmall padding-y-large'>
        <span className='content-emphasis text-title-large block'>{labels.greeting}</span>
        <span className='content-muted text-body-small block'>{labels.subheading}</span>
      </div>

      {generalError && (
        <span
          className='content-system-alert text-body-small padding-bottom-large block'
          role='alert'>
          {generalError}
        </span>
      )}

      <div className='flex width-full flex-col gap-medium'>
        {layout === AddAuthMethodLayout.PasswordFirst ? (
          <React.Fragment>
            {passwordSection}
            <OrDivider label={labels.or} />
            {passkeySection}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {passkeySection}
            <OrDivider label={labels.or} />
            {passwordSection}
          </React.Fragment>
        )}
      </div>
    </form>
  );
};

export default AddAuthMethodPage;
