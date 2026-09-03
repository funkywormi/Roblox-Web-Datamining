import { useEffect, useRef } from "react";
import RouterPath from "../../../enums/RouterPath";
import useSettingsTabAgeState from "../hooks/useSettingsTabAgeState";
import settingsTabEventService from "../services/eventServices/settingsTabEventService";
import { fireTabViewCounter } from "../utils/settingsTabCounters";

// Dummy component that logs a page load event when a settings tab becomes active.
const SettingsTabViewLogger = ({ tabId }: { tabId: RouterPath }): JSX.Element | null => {
  const { ageState, isReady } = useSettingsTabAgeState();
  const hasLogged = useRef(false);

  useEffect(() => {
    // Wait for the age bucket, then report once. This component unmounts when the tab changes,
    // so the guard resets per tab rather than suppressing the next tab's view.
    if (!isReady || hasLogged.current) {
      return;
    }
    hasLogged.current = true;

    settingsTabEventService.authPageloadSettingsTab(tabId, ageState);
    fireTabViewCounter(tabId, ageState);
  }, [tabId, ageState, isReady]);

  return null;
};

export default SettingsTabViewLogger;
