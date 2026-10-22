import { CurrentUser } from "Roblox";
import useSecurityTabContext from "./useSecurityTabContext";
import useSecurityTabExperiment from "./useSecurityTabExperiment";

const useEppFlags = () => {
  const {
    state: { twoStepVerificationMetadata, isTwoStepVerificationMetadataResolved },
  } = useSecurityTabContext();

  const { isEppEnabled } = useSecurityTabExperiment();

  const metadataAllowsEpp =
    !!twoStepVerificationMetadata?.isSettingsTabRedesignEnabled &&
    !!twoStepVerificationMetadata?.isEppUIEnabled;

  const shouldShowEppCard = metadataAllowsEpp && (isEppEnabled ?? false) && !CurrentUser.isUnder13;

  // Pending until both the experiment and the 2SV metadata have settled, unless a requirement is
  // already known to fail.
  const metadataDisqualifies = isTwoStepVerificationMetadataResolved && !metadataAllowsEpp;
  const isEppEligibilityPending =
    !CurrentUser.isUnder13 &&
    isEppEnabled !== false &&
    !metadataDisqualifies &&
    (isEppEnabled === null || !isTwoStepVerificationMetadataResolved);

  return {
    shouldShowEppCard,
    isEppEnabled,
    isEppEligibilityPending,
  };
};

export default useEppFlags;
