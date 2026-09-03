import { CurrentUser } from "Roblox";
import useSecurityTabContext from "./useSecurityTabContext";
import useSecurityTabExperiment from "./useSecurityTabExperiment";

const useEppFlags = () => {
  const {
    state: { twoStepVerificationMetadata },
  } = useSecurityTabContext();

  const { isEppEnabled } = useSecurityTabExperiment();

  const shouldShowEppCard =
    twoStepVerificationMetadata?.isSettingsTabRedesignEnabled &&
    twoStepVerificationMetadata?.isEppUIEnabled &&
    (isEppEnabled ?? false) &&
    !CurrentUser.isUnder13;

  return {
    shouldShowEppCard,
    isEppEnabled,
  };
};

export default useEppFlags;
