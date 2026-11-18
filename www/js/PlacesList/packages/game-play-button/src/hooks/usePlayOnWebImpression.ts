import { useEffect, useRef, type RefObject } from "react";
import { observeVisibility } from "@rbx/core-lib/element-visibility";
import { firePlayOnWebImpressionCounter } from "../utils/playOnWebTelemetryCounters";

const IMPRESSION_VISIBILITY_THRESHOLD = 0.5;

const usePlayOnWebImpression = (
  buttonRef: RefObject<HTMLButtonElement | null>,
  universeId: string,
  isRendered: boolean,
): void => {
  const hasFiredRef = useRef(false);

  useEffect(() => {
    hasFiredRef.current = false;
  }, [universeId]);

  useEffect(() => {
    if (!isRendered || !buttonRef.current || hasFiredRef.current) {
      return undefined;
    }

    const disconnect = observeVisibility(
      { element: buttonRef.current, threshold: IMPRESSION_VISIBILITY_THRESHOLD },
      (isVisible, observer) => {
        if (isVisible && !hasFiredRef.current) {
          hasFiredRef.current = true;
          firePlayOnWebImpressionCounter();
          observer.disconnect();
        }
      },
    );

    return disconnect;
  }, [buttonRef, universeId, isRendered]);
};

export default usePlayOnWebImpression;
