// Container IDs
export const reactLoginContainerId = 'react-login-container';
export const reactLoginPageContainer = (): HTMLElement | null =>
  document.getElementById(reactLoginContainerId);

export const reactWebAppLoginContainerId = 'react-login-web-app';
export const reactWebAppLoginPageContainer = (): HTMLElement | null =>
  document.getElementById(reactWebAppLoginContainerId);

export const landingContainerId = 'react-landing-container';
export const landingPageContainer = (): HTMLElement | null =>
  document.getElementById(landingContainerId);

export const reactRevertAccountContainerId = 'react-revert-account-container';
export const reactRevertAccountContainer = (): HTMLElement | null =>
  document.getElementById(reactRevertAccountContainerId);

export const loginRedirectContainerId = 'login-redirect-web-app';
export const loginRedirectContainer = (): HTMLElement | null =>
  document.getElementById(loginRedirectContainerId);

export const RETURNURL = 'returnUrl';
