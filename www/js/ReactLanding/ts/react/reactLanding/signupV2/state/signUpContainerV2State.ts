import { create } from 'zustand';

export enum SignUpV2Step {
  SignUpForm = 'signUpForm',
  AddAuthMethod = 'addAuthMethod'
}

export enum SignUpV2Operation {
  Idle = 'idle',
  CreatingPasskey = 'creatingPasskey',
  CreatingPassword = 'creatingPassword'
}

type SignUpContainerV2State = {
  step: SignUpV2Step;
  operation: SignUpV2Operation;
  hasPasskeyRegistrationError: boolean;
  hasPasskeyAttemptError: boolean;
  isPasskeyUnsupported: boolean;
  shouldSkipAutomaticPasskey: boolean;
  beginPasskey: () => void;
  beginPassword: () => void;
  showAddAuthMethod: (isPasskeyUnsupported?: boolean) => void;
  showPasskeyAttemptFailure: (isPasskeyUnsupported: boolean) => void;
  clearPasskeyRegistrationError: () => void;
  backToSignUpForm: () => void;
  recoverFromPasskeyRegistrationFailure: () => void;
  finishOperation: () => void;
  reset: () => void;
};

const initialState = {
  step: SignUpV2Step.SignUpForm,
  operation: SignUpV2Operation.Idle,
  hasPasskeyRegistrationError: false,
  hasPasskeyAttemptError: false,
  isPasskeyUnsupported: false,
  shouldSkipAutomaticPasskey: false
};

const useSignUpContainerV2State = create<SignUpContainerV2State>(set => ({
  ...initialState,
  beginPasskey: () =>
    set({
      operation: SignUpV2Operation.CreatingPasskey,
      hasPasskeyAttemptError: false
    }),
  beginPassword: () =>
    set({
      operation: SignUpV2Operation.CreatingPassword,
      hasPasskeyAttemptError: false
    }),
  showAddAuthMethod: (isPasskeyUnsupported = false) =>
    set({
      step: SignUpV2Step.AddAuthMethod,
      operation: SignUpV2Operation.Idle,
      hasPasskeyRegistrationError: false,
      hasPasskeyAttemptError: false,
      isPasskeyUnsupported
    }),
  showPasskeyAttemptFailure: isPasskeyUnsupported =>
    set({
      operation: SignUpV2Operation.Idle,
      hasPasskeyAttemptError: true,
      isPasskeyUnsupported
    }),
  // Only the message: the bind failure named a username the user has now
  // replaced, but the auto-prompt must stay suppressed.
  clearPasskeyRegistrationError: () => set({ hasPasskeyRegistrationError: false }),
  // Auto-prompt suppression outlives a back navigation: once a bind failure has
  // orphaned an account, re-prompting on the next Continue risks orphaning
  // another one. `reset` on unmount is what re-enables the prompt.
  backToSignUpForm: () =>
    set(state => ({
      ...initialState,
      shouldSkipAutomaticPasskey: state.shouldSkipAutomaticPasskey
    })),
  recoverFromPasskeyRegistrationFailure: () =>
    set({
      step: SignUpV2Step.SignUpForm,
      operation: SignUpV2Operation.Idle,
      hasPasskeyRegistrationError: true,
      hasPasskeyAttemptError: false,
      isPasskeyUnsupported: false,
      shouldSkipAutomaticPasskey: true
    }),
  finishOperation: () => set({ operation: SignUpV2Operation.Idle }),
  reset: () => set(initialState)
}));

export default useSignUpContainerV2State;
