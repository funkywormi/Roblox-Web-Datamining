import { useEffect, useState } from "react";
import { window as browserWindow } from "@rbx/core-lib/browser";

// Below this viewport width the two-pane chat window shows one pane at a time: the 280px list plus
// a readable conversation pane no longer fit side by side.
const TWO_PANE_MIN_VIEWPORT_WIDTH_PX = 720;

const isNarrowViewport = (): boolean =>
  browserWindow != null && browserWindow.innerWidth < TWO_PANE_MIN_VIEWPORT_WIDTH_PX;

export const useIsSinglePaneViewport = (): boolean => {
  const [isSinglePane, setIsSinglePane] = useState(isNarrowViewport);

  useEffect(() => {
    const targetWindow = browserWindow;
    if (targetWindow == null) {
      return undefined;
    }
    const update = () => {
      setIsSinglePane(isNarrowViewport());
    };
    targetWindow.addEventListener("resize", update);
    return () => {
      targetWindow.removeEventListener("resize", update);
    };
  }, []);

  return isSinglePane;
};

export default useIsSinglePaneViewport;
