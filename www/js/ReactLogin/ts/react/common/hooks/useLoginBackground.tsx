import useExperiments from './useExperiments';
import useGetUserLocale from './useGetUserLocale';
import { experimentLayer } from '../../reactLogin/constants/loginConstants';
import getLocalizedBackgroundSuffix from '../utils/localeUtils';

export const useLoginBackground = (): {
  isLoginBackgroundImageEnabled: boolean;
  loginBackgroundClass: string;
} => {
  const experiments = useExperiments(experimentLayer);
  const userLocaleData = useGetUserLocale();

  if (experiments.isLoading) {
    return {
      isLoginBackgroundImageEnabled: false,
      loginBackgroundClass: ''
    };
  }

  const isLoginBackgroundImageEnabled = experiments.IsLoginBackgroundImageEnabled as boolean;
  const baseLoginBackgroundClass = experiments.LoginBackgroundClass as string;
  const useLocalizedLoginBackground = experiments.UseLocalizedLoginBackground as boolean;

  const getLoginBackgroundClass = (): string => {
    if (!isLoginBackgroundImageEnabled || !baseLoginBackgroundClass) {
      return '';
    }

    if (!useLocalizedLoginBackground) {
      return baseLoginBackgroundClass;
    }

    // If user locale data is still loading, return empty string to avoid flickering
    if (userLocaleData.isLoading) {
      return '';
    }

    if (!userLocaleData.data || userLocaleData.isError) {
      return baseLoginBackgroundClass;
    }

    const localizedSuffix = getLocalizedBackgroundSuffix(userLocaleData.data);

    // If we have a localized version for this locale, use it
    if (localizedSuffix) {
      return `${baseLoginBackgroundClass}-localized-${localizedSuffix}`;
    }

    // Otherwise, fall back to the base background class
    return baseLoginBackgroundClass;
  };

  return {
    isLoginBackgroundImageEnabled,
    loginBackgroundClass: getLoginBackgroundClass()
  };
};

export default useLoginBackground;
