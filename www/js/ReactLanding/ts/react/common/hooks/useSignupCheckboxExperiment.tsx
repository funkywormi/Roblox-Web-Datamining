import useExperiments from './useExperiments';
import { experimentLayer } from '../../reactLanding/constants/landingConstants';
import { signupFormStrings } from '../../reactLanding/constants/signupConstants';

type SignupCheckboxExperimentParams = {
  isSignupCheckboxEnabled: boolean;
  signupAgreementsTranslationKey: string | null;
};

export const useSignupCheckboxExperiment = (): SignupCheckboxExperimentParams => {
  const experiments = useExperiments(experimentLayer);

  const getSignupCheckboxExperiment = (): SignupCheckboxExperimentParams => {
    if (experiments.isLoading) {
      return {
        isSignupCheckboxEnabled: false,
        signupAgreementsTranslationKey: null
      };
    }

    // CTA text, i.e. "I agree to ..."
    const checkboxTextKeyMap: Record<number, string | null> = {
      1: signupFormStrings.ComplianceFullCopyCheckbox,
      2: signupFormStrings.ComplianceShortCopyCheckbox
    };

    const noCheckboxTextMap: Record<number, string | null> = {
      1: signupFormStrings.ComplianceFullCopy,
      // This case shouldn't happen but we include a fallback just in case
      2: null
    };

    const isSignupCheckboxEnabled = experiments.shouldRequireSignupCheckbox as boolean;
    const textVariant = experiments.signupLegalDisclaimerTextVariant as number;
    const signupAgreementsTranslationKey = isSignupCheckboxEnabled
      ? checkboxTextKeyMap[textVariant]
      : noCheckboxTextMap[textVariant];

    return {
      isSignupCheckboxEnabled,
      signupAgreementsTranslationKey
    };
  };

  return getSignupCheckboxExperiment();
};

export default useSignupCheckboxExperiment;
