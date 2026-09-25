import useExperiments from "@rbx/authentication-common/hooks/useExperiments";
import useGetUserLocale from "@rbx/authentication-common/hooks/useGetUserLocale";
import getLocalizedBackgroundSuffix from "@rbx/authentication-common/utils/localeUtils";
import { defaultLandingBackgroundClass } from "../constants/signupConstants";
import { experimentLayer } from "../constants/landingConstants";

export const useLandingBackground = (): string => {
  const experiments = useExperiments(experimentLayer);
  const userLocaleData = useGetUserLocale();

  const getLandingBackgroundClass = (): string => {
    if (experiments.isLoading) {
      return "";
    }

    // Return default landing background class if null or undefined
    if (!experiments.LandingBackgroundClass) {
      return defaultLandingBackgroundClass;
    }

    const landingBackgroundClass = experiments.LandingBackgroundClass as string;

    if (experiments.UseLocalizedLandingBackground) {
      if (userLocaleData.isLoading) {
        return "";
      }
      if (!userLocaleData.data || userLocaleData.isError) {
        return landingBackgroundClass;
      }

      const localizedSuffix = getLocalizedBackgroundSuffix(userLocaleData.data);

      // If we have a localized version for this locale, use it
      if (localizedSuffix) {
        return `${landingBackgroundClass}-localized-${localizedSuffix}`;
      }

      // Otherwise, fall back to the base background class
      return landingBackgroundClass;
    }

    return landingBackgroundClass;
  };

  return getLandingBackgroundClass();
};

export default useLandingBackground;
