import { useEffect, useState } from "react";
import { ExperimentationService } from "Roblox";

const SECURITY_TAB_LAYER = "AccountSecurity.SecurityTab";

// Using null instead of boolean to avoid flickering (starting with false might return old UI until we get value of true)
interface SecurityTabExperiment {
  isEppEnabled: boolean | null;
}

const useSecurityTabExperiment = (): SecurityTabExperiment => {
  const [isEppEnabled, setIsEppEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const getSecurityTabExperiment = async () => {
      if (ExperimentationService?.getAllValuesForLayer) {
        const ixpResult = await ExperimentationService.getAllValuesForLayer(SECURITY_TAB_LAYER);
        const eppValue = ixpResult?.isEppEnabled ?? false;
        setIsEppEnabled(!!eppValue);
      } else {
        setIsEppEnabled(false);
      }
    };

    // Default to false if promise fails
    getSecurityTabExperiment().catch(() => {
      setIsEppEnabled(false);
    });
  }, []);

  return {
    isEppEnabled,
  };
};

export default useSecurityTabExperiment;
