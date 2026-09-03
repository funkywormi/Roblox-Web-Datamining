import { useEffect, useState } from "react";
import { ExperimentationService } from "Roblox";

const SECURITY_TAB_LAYER = "AccountSecurity.SecurityTab";

// Using null instead of boolean to avoid flickering (starting with false might return old UI until we get value of true)
interface SecurityTabExperiment {
  isSecurityTabRedesignEnabled: boolean | null;
  isEppEnabled: boolean | null;
}

const useSecurityTabExperiment = (): SecurityTabExperiment => {
  const [isSecurityTabRedesignEnabled, setIsSecurityTabRedesignEnabled] = useState<boolean | null>(
    null,
  );
  const [isEppEnabled, setIsEppEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const getSecurityTabExperiment = async () => {
      if (ExperimentationService?.getAllValuesForLayer) {
        const ixpResult = await ExperimentationService.getAllValuesForLayer(SECURITY_TAB_LAYER);
        const redesignValue = ixpResult?.isSecurityTabRedesignEnabled ?? false;
        const eppValue = ixpResult?.isEppEnabled ?? false;
        setIsSecurityTabRedesignEnabled(!!redesignValue);
        setIsEppEnabled(!!eppValue);
      } else {
        setIsSecurityTabRedesignEnabled(false);
        setIsEppEnabled(false);
      }
    };

    // Default to false if promise fails
    getSecurityTabExperiment().catch(() => {
      setIsSecurityTabRedesignEnabled(false);
      setIsEppEnabled(false);
    });
  }, []);

  return {
    isSecurityTabRedesignEnabled,
    isEppEnabled,
  };
};

export default useSecurityTabExperiment;
