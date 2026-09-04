import React, { useEffect, useRef } from 'react';
import EVENT_CONSTANTS from '../../../common/constants/eventsConstants';
import { TSignupParams } from '../../../common/types/signupTypes';
import usePasskeyRegistration, {
  PasskeyAttemptOutcome,
  PasskeyCeremonyTelemetry
} from '../../hooks/usePasskeyRegistration';
import {
  sendAddAuthMethodBackEvent,
  sendAddAuthMethodPageReachedEvent,
  sendAuthMethodChosenEvent,
  sendSignupErrorShownEvent,
  sendSignUpV2SubmitEvent
} from '../../services/eventService';
import { parseErrorCode } from '../../../common/utils/requestUtils';
import {
  submitSignup as submitProductionSignup,
  SubmitSignupOptions
} from '../../services/signupSubmissionService';
import { classifySignupError } from '../../utils/signupErrorUtils';
import AddAuthMethodPage, {
  AddAuthMethodLayout,
  AddAuthMethodPageLabels
} from '../components/AddAuthMethodPage';
import { PasswordRequirementItem } from '../components/PasswordRequirementList';
import {
  getSignUpV2CardClassName,
  signupV2CardContentClassName
} from '../constants/signupV2Styles';
import SignUpFormV2, {
  SignUpFormV2Props,
  SignUpFormV2SubmissionMode
} from '../components/SignUpFormV2';
import useAnimatedCardHeight from '../hooks/useAnimatedCardHeight';
import useSignUpContainerV2State, {
  SignUpV2Operation,
  SignUpV2Step
} from '../state/signUpContainerV2State';
import { SignUpV2Treatment } from '../utils/signupV2ExperimentUtils';

export { SignUpV2Operation, SignUpV2Step } from '../state/signUpContainerV2State';
export { SignUpV2Treatment } from '../utils/signupV2ExperimentUtils';

type PasswordSignUpFormProps = Extract<
  SignUpFormV2Props,
  { submissionMode: SignUpFormV2SubmissionMode.Password }
>;

export type SignUpContainerV2FormProps = Omit<
  PasswordSignUpFormProps,
  'submissionMode' | 'onSubmit' | 'isSubmitting' | 'isSubmitDisabled'
>;

export type SignUpContainerV2Props = {
  treatment: SignUpV2Treatment;
  formProps: SignUpContainerV2FormProps;
  addAuthMethodLabels: AddAuthMethodPageLabels;
  passwordRequirements?: PasswordRequirementItem[];
  passkeyRegistrationError: string;
  passkeyAttemptError: string;
  buildSignupParams: (password: string) => TSignupParams;
  signupCompletionOptions: Omit<SubmitSignupOptions, 'params'>;
  submitSignupRequest?: (options: SubmitSignupOptions) => Promise<void>;
  onSignupError: (error: unknown) => void;
  onPasskeyOutcome?: (outcome: PasskeyAttemptOutcome) => void;
  attemptPasskeyRegistration?: (
    username: string,
    telemetry: PasskeyCeremonyTelemetry
  ) => Promise<PasskeyAttemptOutcome>;
  isInitialSubmitDisabled?: boolean;
  isPasswordSubmitDisabled?: boolean;
  isPasskeySubmitDisabled?: boolean;
};

const getAddAuthMethodLayout = (treatment: SignUpV2Treatment): AddAuthMethodLayout => {
  if (treatment === SignUpV2Treatment.PasskeyFirst) {
    return AddAuthMethodLayout.PasskeyFirst;
  }
  return AddAuthMethodLayout.PasswordFirst;
};

const getAddAuthMethodEntryReason = (outcome: PasskeyAttemptOutcome): string => {
  const { addAuthMethodEntry } = EVENT_CONSTANTS.state.signUpV2;
  switch (outcome.kind) {
    case 'unsupported':
      return addAuthMethodEntry.unsupported;
    case 'dismissed':
      return addAuthMethodEntry.dismissed;
    default:
      return addAuthMethodEntry.error;
  }
};

const SignUpContainerV2 = ({
  treatment,
  formProps,
  addAuthMethodLabels,
  passwordRequirements,
  passkeyRegistrationError,
  passkeyAttemptError,
  buildSignupParams,
  signupCompletionOptions,
  submitSignupRequest = submitProductionSignup,
  onSignupError,
  onPasskeyOutcome,
  attemptPasskeyRegistration,
  isInitialSubmitDisabled = false,
  isPasswordSubmitDisabled = false,
  isPasskeySubmitDisabled = false
}: SignUpContainerV2Props): JSX.Element => {
  const {
    step,
    operation,
    hasPasskeyRegistrationError,
    hasPasskeyAttemptError,
    isPasskeyUnsupported,
    shouldSkipAutomaticPasskey,
    beginPasskey,
    beginPassword,
    showAddAuthMethod,
    showPasskeyAttemptFailure,
    clearPasskeyRegistrationError,
    backToSignUpForm,
    recoverFromPasskeyRegistrationFailure,
    finishOperation,
    reset
  } = useSignUpContainerV2State();
  const { attemptPreauthRegistration } = usePasskeyRegistration();
  const attemptPasskey = attemptPasskeyRegistration ?? attemptPreauthRegistration;
  const signUpHeadingRef = useRef<HTMLHeadingElement>(null);
  const addAuthMethodHeadingRef = useRef<HTMLHeadingElement>(null);
  const animatedCardRef = useRef<HTMLDivElement>(null);
  const signUpFormPanelRef = useRef<HTMLDivElement>(null);
  const addAuthMethodPanelRef = useRef<HTMLDivElement>(null);
  const previousStepRef = useRef(step);
  const {
    password,
    passwordError,
    isPasswordVisible,
    onPasswordChange,
    onPasswordVisibilityToggle,
    onPasswordFocus,
    onPasswordBlur,
    onUsernameChange,
    ...sharedFormProps
  } = formProps;

  const handleUsernameChange = (username: string): void => {
    if (hasPasskeyRegistrationError) {
      clearPasskeyRegistrationError();
    }
    onUsernameChange(username);
  };

  const submitParams = async (
    params: TSignupParams,
    isPasskeySubmission: boolean
  ): Promise<void> => {
    try {
      await submitSignupRequest({
        params,
        ...signupCompletionOptions
      });
    } catch (error) {
      const outcome = classifySignupError(error, () => false);
      if (isPasskeySubmission && outcome.type === 'passkeyRegistrationFailed') {
        // This branch returns before `onSignupError`, so it is the only place a
        // rejected passkey bind can be recorded.
        sendSignupErrorShownEvent(
          EVENT_CONSTANTS.context.schematizedSignupForm,
          outcome,
          parseErrorCode(error)
        );
        formProps.onUsernameChange('');
        recoverFromPasskeyRegistrationFailure();
        return;
      }
      try {
        onSignupError(error);
      } finally {
        finishOperation();
      }
    }
  };

  const handleCreatePassword = async (): Promise<void> => {
    beginPassword();
    await submitParams(buildSignupParams(password), false);
  };

  const handleCreatePasskey = async (): Promise<void> => {
    beginPasskey();
    const isDeliberateRetry = step === SignUpV2Step.AddAuthMethod;

    let outcome: PasskeyAttemptOutcome;
    try {
      outcome = await attemptPasskey(formProps.username, {
        ctx: isDeliberateRetry
          ? EVENT_CONSTANTS.context.addAuthMethodPage
          : EVENT_CONSTANTS.context.schematizedSignupForm,
        trigger: isDeliberateRetry
          ? EVENT_CONSTANTS.field.deliberateRetry
          : EVENT_CONSTANTS.field.autoPrompt
      });
    } catch {
      outcome = { kind: 'error', reason: 'unexpectedAttemptFailure' };
    }
    onPasskeyOutcome?.(outcome);

    if (outcome.kind !== 'success') {
      const isUnsupported = outcome.kind === 'unsupported';
      if (isDeliberateRetry) {
        // No pageload: already on the fallback page, so emitting one here would
        // double-count the entry.
        showPasskeyAttemptFailure(isUnsupported);
      } else {
        sendAddAuthMethodPageReachedEvent(getAddAuthMethodEntryReason(outcome));
        showAddAuthMethod(isUnsupported);
      }
      return;
    }

    await submitParams(
      {
        ...buildSignupParams(''),
        passkeySessionId: outcome.result.sessionId,
        passkeyRegistrationResponse: outcome.result.registrationResponse
      },
      true
    );
  };

  useEffect(() => {
    return reset;
  }, [reset]);

  useEffect(() => {
    const previousStep = previousStepRef.current;
    previousStepRef.current = step;
    if (previousStep === step) {
      return;
    }

    const activeHeadingRef =
      step === SignUpV2Step.AddAuthMethod ? addAuthMethodHeadingRef : signUpHeadingRef;
    activeHeadingRef.current?.focus();
  }, [step]);

  const isCreatingPasskey = operation === SignUpV2Operation.CreatingPasskey;
  const isCreatingPassword = operation === SignUpV2Operation.CreatingPassword;
  const isSubmitting = operation !== SignUpV2Operation.Idle;
  const cardClassName = getSignUpV2CardClassName(treatment);
  const isAddAuthMethodStep = step === SignUpV2Step.AddAuthMethod;
  const activePanelRef = isAddAuthMethodStep ? addAuthMethodPanelRef : signUpFormPanelRef;
  const minimumPanelRef = isAddAuthMethodStep ? signUpFormPanelRef : undefined;
  useAnimatedCardHeight(animatedCardRef, activePanelRef, minimumPanelRef);

  if (treatment === SignUpV2Treatment.FoundationControl) {
    return (
      <div ref={animatedCardRef} className={cardClassName} data-testid='signup-v2-animated-card'>
        <div ref={signUpFormPanelRef} className='self-start width-full'>
          <SignUpFormV2
            {...sharedFormProps}
            cardClassName={signupV2CardContentClassName}
            submissionMode={SignUpFormV2SubmissionMode.Password}
            onUsernameChange={onUsernameChange}
            password={password}
            passwordError={passwordError}
            isPasswordVisible={isPasswordVisible}
            isSubmitting={isSubmitting}
            isSubmitDisabled={isPasswordSubmitDisabled}
            onPasswordChange={onPasswordChange}
            onPasswordVisibilityToggle={onPasswordVisibilityToggle}
            onPasswordFocus={onPasswordFocus}
            onPasswordBlur={onPasswordBlur}
            onSubmit={() => {
              sendSignUpV2SubmitEvent(EVENT_CONSTANTS.ctype.password);
              // eslint-disable-next-line no-void
              void handleCreatePassword();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div ref={animatedCardRef} className={cardClassName} data-testid='signup-v2-animated-card'>
      <div className='grid width-full'>
        <div
          ref={signUpFormPanelRef}
          className={`self-start [grid-area:1/1] ${
            isAddAuthMethodStep ? 'invisible pointer-events-none' : ''
          }`}
          aria-hidden={isAddAuthMethodStep}
          data-testid='signup-v2-form-panel'>
          <SignUpFormV2
            {...sharedFormProps}
            cardClassName={signupV2CardContentClassName}
            submissionMode={SignUpFormV2SubmissionMode.Passkey}
            headingRef={signUpHeadingRef}
            onUsernameChange={handleUsernameChange}
            generalError={
              hasPasskeyRegistrationError ? passkeyRegistrationError : sharedFormProps.generalError
            }
            isSubmitting={isSubmitting}
            isSubmitDisabled={isInitialSubmitDisabled}
            onSubmit={() => {
              if (shouldSkipAutomaticPasskey) {
                sendSignUpV2SubmitEvent(EVENT_CONSTANTS.ctype.autoPromptSuppressed);
                sendAddAuthMethodPageReachedEvent(
                  EVENT_CONSTANTS.state.signUpV2.addAuthMethodEntry.autoPromptSuppressed
                );
                showAddAuthMethod();
              } else {
                sendSignUpV2SubmitEvent(EVENT_CONSTANTS.ctype.passkeyCeremony);
                // eslint-disable-next-line no-void
                void handleCreatePasskey();
              }
            }}
          />
        </div>

        <div
          ref={addAuthMethodPanelRef}
          className={`self-start [grid-area:1/1] ${
            isAddAuthMethodStep ? '' : 'invisible pointer-events-none'
          }`}
          aria-hidden={!isAddAuthMethodStep}
          data-testid='signup-v2-add-auth-method-panel'>
          <AddAuthMethodPage
            layout={getAddAuthMethodLayout(treatment)}
            labels={addAuthMethodLabels}
            headingRef={addAuthMethodHeadingRef}
            cardClassName={signupV2CardContentClassName}
            password={password}
            isPasswordVisible={isPasswordVisible}
            passwordRequirements={passwordRequirements}
            passwordError={passwordError}
            generalError={hasPasskeyAttemptError ? passkeyAttemptError : formProps.generalError}
            isCreatingPassword={isCreatingPassword}
            isCreatingPasskey={isCreatingPasskey}
            isPasswordSubmitDisabled={isPasswordSubmitDisabled}
            isPasskeySubmitDisabled={isPasskeySubmitDisabled || isPasskeyUnsupported}
            onPasswordChange={onPasswordChange}
            onPasswordVisibilityToggle={onPasswordVisibilityToggle}
            onPasswordBlur={onPasswordBlur}
            onCreatePassword={() => {
              sendAuthMethodChosenEvent(EVENT_CONSTANTS.btn.password);
              // eslint-disable-next-line no-void
              void handleCreatePassword();
            }}
            onCreatePasskey={() => {
              sendAuthMethodChosenEvent(EVENT_CONSTANTS.btn.passkey);
              // eslint-disable-next-line no-void
              void handleCreatePasskey();
            }}
            onBack={() => {
              sendAddAuthMethodBackEvent();
              backToSignUpForm();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SignUpContainerV2;
