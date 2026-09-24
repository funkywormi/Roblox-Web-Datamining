import { useEffect } from "react";
import { userId } from "@rbx/core-scripts/meta/user";
import type { SettingsJourneyArea } from "../services/journeys/createSettingsJourneyTracker";
import settingsJourneyService from "../services/journeys/settingsJourneyService";

/** Primitive dependencies prevent metadata refetches from becoming extra views. */
const useSettingsJourneyScreen = (
  area: SettingsJourneyArea,
  screen: string | undefined,
  route: string,
  ready: boolean,
): void => {
  const actorId = userId();

  useEffect(() => {
    if (!ready || !screen) return undefined;
    settingsJourneyService.screenViewed({ area, screen, route });
    return () => settingsJourneyService.screenLeft(route);
  }, [ready, area, screen, route, actorId]);
};

export default useSettingsJourneyScreen;
