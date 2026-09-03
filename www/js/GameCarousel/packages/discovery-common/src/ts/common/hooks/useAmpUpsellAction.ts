import { useCallback } from "react";
import { ampUpsellCounterEvents } from "../constants/ampUpsellConstants";
import { logUpsellBannerEvent } from "../../homePageUpsellCard/services/upsellAnalyticsService";
import { UpsellEventType } from "../../homePageUpsellCard/constants/upsellAnalyticsConstants";
import { TAnalyticsProps } from "../../homePageUpsellCard/types/upsellCardTypes";

type TUseAmpUpsellActionParams = {
  featureName?: string;
  namespace?: string;
  completionCallback?: () => void;
  analyticsConfig?: TAnalyticsProps;
  entryPointEventCtx?: string;
};

const useAmpUpsellAction = ({
  featureName,
  namespace,
  completionCallback,
  analyticsConfig,
  entryPointEventCtx,
}: TUseAmpUpsellActionParams): (() => void) | undefined => {
  const ampUpsellAction = useCallback(() => {
    if (!featureName) {
      return;
    }

    const accessManagementUpsellService = window.Roblox.AccessManagementUpsellV2Service;
    if (!accessManagementUpsellService) {
      window.EventTracker?.fireEvent(ampUpsellCounterEvents.AccessManagementServiceMissing);
      return;
    }

    accessManagementUpsellService
      .startAccessManagementUpsell({
        featureName,
        namespace,
        isAsyncCall: false,
        featureSpecificData: { context: entryPointEventCtx },
      })
      .then(success => {
        if (success) {
          completionCallback?.();
        }
      })
      .catch(() => {
        window.EventTracker?.fireEvent(ampUpsellCounterEvents.StartUpsellFailed);
      });

    if (analyticsConfig) {
      logUpsellBannerEvent(UpsellEventType.ButtonClick, analyticsConfig);
    }
  }, [featureName, namespace, completionCallback, analyticsConfig, entryPointEventCtx]);

  if (!featureName) {
    return undefined;
  }
  return ampUpsellAction;
};

export default useAmpUpsellAction;
