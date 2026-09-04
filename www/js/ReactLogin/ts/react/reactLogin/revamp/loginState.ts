import { create } from 'zustand';
import { TUserData } from '../../common/types/accountSelectorTypes';
import { CredentialType } from '../../common/types/loginTypes';

export type LoginCredential = {
  type: CredentialType;
  value: string;
  password: string;
};

export type LoginStep =
  | { step: 'loading' }
  | { step: 'login' }
  | { step: 'switch-account' }
  | { step: 'otp' }
  | { step: 'xdl' }
  | {
      step: 'select-account';
      credential: LoginCredential;
      users: TUserData[];
    }
  | {
      step: 'security-questions';
      credential: LoginCredential;
      userId: string;
      sessionId: string;
    }
  | {
      step: 'security-notification';
      credential: LoginCredential;
    }
  | {
      step: '2sv';
      credential: LoginCredential;
      userId: string;
      challengeId: string;
    }
  | { step: 'finish' };

export type LoginState = LoginStep & {
  identifier: string;
  password: string;
  switchAccount?: 'adding-account' | 'limit-reached';
  errorMessage?: string;
};

export const useLogin = create<LoginState>()(() => ({
  step: 'loading',
  identifier: '',
  password: ''
}));

export const setIdentifier = (identifier: string): void => useLogin.setState({ identifier });
export const setPassword = (password: string): void => useLogin.setState({ password });

export const startLogin = ({
  switchAccount
}: {
  switchAccount?: 'adding-account' | 'limit-reached';
}): void => useLogin.setState({ step: 'login', switchAccount });

export const backToLogin = (errorMessage?: string): void =>
  useLogin.setState({ step: 'login', errorMessage });

export const startSwitchAccount = (): void => useLogin.setState({ step: 'switch-account' });

export const startOtp = (): void => useLogin.setState({ step: 'otp' });
export const startXdl = (): void => useLogin.setState({ step: 'xdl' });
export const startSelectAccount = ({
  credential,
  users
}: {
  credential: LoginCredential;
  users: TUserData[];
}): void => useLogin.setState({ step: 'select-account', credential, users });

export const startSecurityQuestions = ({
  credential,
  userId,
  sessionId
}: {
  credential: LoginCredential;
  userId: string;
  sessionId: string;
}): void => useLogin.setState({ step: 'security-questions', credential, userId, sessionId });

export const startSecurityNotification = ({ credential }: { credential: LoginCredential }): void =>
  useLogin.setState({ step: 'security-notification', credential });

export const start2sv = ({
  credential,
  userId,
  challengeId
}: {
  credential: LoginCredential;
  userId: string;
  challengeId: string;
}): void => useLogin.setState({ step: '2sv', credential, userId, challengeId });

export const finishLogin = (): void =>
  useLogin.setState({ step: 'finish', errorMessage: undefined });
