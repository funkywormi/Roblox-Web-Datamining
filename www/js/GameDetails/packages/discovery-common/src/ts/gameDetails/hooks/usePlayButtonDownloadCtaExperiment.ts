import experimentConstants from "../../common/constants/experimentConstants";
import useExperimentValues from "../../common/hooks/useExperimentValues";

const MARKETING_CAMPAIGN_REFERRED_INPUTS = {
  isMarketingCampaignReferred: true,
};
const NON_MARKETING_CAMPAIGN_INPUTS = {
  isMarketingCampaignReferred: false,
};

type UsePlayButtonDownloadCtaExperimentProps = {
  isEligible: boolean;
  isMarketingCampaignReferred: boolean;
};

type UsePlayButtonDownloadCtaExperimentResult = {
  isDownloadButtonOverrideEnabled: boolean;
  isLoading: boolean;
};

const usePlayButtonDownloadCtaExperiment = ({
  isEligible,
  isMarketingCampaignReferred,
}: UsePlayButtonDownloadCtaExperimentProps): UsePlayButtonDownloadCtaExperimentResult => {
  const experimentInputs = isMarketingCampaignReferred
    ? MARKETING_CAMPAIGN_REFERRED_INPUTS
    : NON_MARKETING_CAMPAIGN_INPUTS;
  const { ixpData, isLoading } = useExperimentValues(
    experimentConstants.layerNames.gameDetailsBtid,
    experimentConstants.defaultValues.gameDetailsBtid,
    {
      inputs: experimentInputs,
      enabled: isEligible,
    },
  );

  return {
    isDownloadButtonOverrideEnabled: isEligible && ixpData.isDownloadButtonOverrideEnabled === true,
    isLoading: isEligible && isLoading,
  };
};

export default usePlayButtonDownloadCtaExperiment;
