import { useEffect } from 'react';
import { fireEvent } from '@rbx/www-common/event-tracker';

const RENDER_TRACKING_PREFIX = 'RenderTracking';
const WEBAPP_NAME = 'Purchase';

const useModalShownTracking = (componentName: string, isShown: boolean): void => {
  useEffect(() => {
    if (isShown) {
      fireEvent(`${RENDER_TRACKING_PREFIX}-${WEBAPP_NAME}-${componentName}`);
    }
  }, [isShown]);
};

export default useModalShownTracking;
