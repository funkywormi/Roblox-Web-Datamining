import { useEffect, RefObject } from "react";
import sendAXTracking from "./sendAXTracking";
import { AXSendTrackingContextType } from "./types";
import useIsElementVisible from "./useIsElementVisible";

function useAXTrackView(context: AXSendTrackingContextType): [RefObject<HTMLDivElement>] {
  const [ref, isVisible] = useIsElementVisible();

  useEffect(() => {
    if (isVisible) {
      sendAXTracking(context);
    }
  }, [context, isVisible]);

  return [ref];
}

export default useAXTrackView;
