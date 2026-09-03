import useSecurityTabContext from "./useSecurityTabContext";
import useSecurityTabExperiment from "./useSecurityTabExperiment";

const useRedesignFlags = () => {
  const {
    state: { twoStepVerificationMetadata },
  } = useSecurityTabContext();

  const { isSecurityTabRedesignEnabled } = useSecurityTabExperiment();

  const isRedesignEnabled =
    twoStepVerificationMetadata?.isSettingsTabRedesignEnabled &&
    (isSecurityTabRedesignEnabled ?? false);

  return {
    isRedesignEnabled,
    isSecurityTabRedesignEnabled,
  };
};

export default useRedesignFlags;
