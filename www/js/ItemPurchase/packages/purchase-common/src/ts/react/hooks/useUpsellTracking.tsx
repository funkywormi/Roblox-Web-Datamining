import { useCallback, useEffect } from 'react';
import { fireEvent } from 'roblox-event-tracker';

const RENDER_TRACKING_PREFIX = 'RenderTracking';
const WEBAPP_NAME = 'Purchase';

const buildUpsellTrackingEventName = (
  componentName: string,
  assetType: string,
  action: 'open' | 'click'
): string => `${RENDER_TRACKING_PREFIX}-${WEBAPP_NAME}-${componentName}-${assetType}-${action}`;

const useUpsellTracking = (
  componentName: string,
  assetType: string,
  shouldFireOpen: boolean
): { trackUpsellClick: () => void } => {
  useEffect(() => {
    if (shouldFireOpen) {
      fireEvent(buildUpsellTrackingEventName(componentName, assetType, 'open'));
    }
  }, [componentName, assetType, shouldFireOpen]);

  const trackUpsellClick = useCallback(() => {
    fireEvent(buildUpsellTrackingEventName(componentName, assetType, 'click'));
  }, [componentName, assetType]);

  return { trackUpsellClick };
};

export default useUpsellTracking;
