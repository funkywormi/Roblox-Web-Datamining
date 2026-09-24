import type { UnifiedLogger } from "@rbx/unified-logger";
import type { UserSetting } from "@rbx/user-settings";

export type SettingsJourneyArea = "privacy" | "parental-controls";
export type SettingsJourneyLogger = Pick<UnifiedLogger, "logImpressionEvent" | "logClickEvent">;

export type SettingsJourneyScreen = {
  area: SettingsJourneyArea;
  screen: string;
  // Used only in memory to distinguish navigation, including a child switch.
  route: string;
};

const normalizeRoute = (route: string): string => (route.split("?")[0] ?? "").replace(/\/$/, "");

/** Owns event semantics only. Session IDs, expiry and delivery belong to Unified Logger. */
export const createSettingsJourneyTracker = ({
  createLogger,
  getActorId,
  getRoute,
}: {
  createLogger: () => SettingsJourneyLogger;
  getActorId: () => number | null;
  getRoute: () => string;
}) => {
  let enabled = false;
  let logger: SettingsJourneyLogger | undefined;
  let activeScreen: (SettingsJourneyScreen & { actorId: number }) | undefined;

  const getLogger = (): SettingsJourneyLogger => {
    logger ??= createLogger();
    return logger;
  };

  return {
    setEnabled(nextEnabled: boolean): void {
      if (enabled !== nextEnabled) {
        enabled = nextEnabled;
        activeScreen = undefined;
        logger = undefined;
      }
    },

    screenViewed(screen: SettingsJourneyScreen): void {
      try {
        if (!enabled) return;
        const actorId = getActorId();
        const route = normalizeRoute(screen.route);
        if (
          actorId === null ||
          !Number.isSafeInteger(actorId) ||
          actorId <= 0 ||
          !screen.screen ||
          (route !== `/${screen.area}` && !route.startsWith(`/${screen.area}/`)) ||
          normalizeRoute(getRoute()) !== route
        ) {
          return;
        }
        if (
          activeScreen?.route === route &&
          activeScreen.screen === screen.screen &&
          activeScreen.actorId === actorId
        ) {
          return;
        }
        getLogger().logImpressionEvent({
          eventName: "settingsScreenViewed",
          parameters: { schemaVersion: "1", area: screen.area, screen: screen.screen },
        });
        activeScreen = { ...screen, route, actorId };
      } catch {
        // Analytics must not interrupt navigation or settings updates.
      }
    },

    screenLeft(route: string): void {
      if (activeScreen?.route === normalizeRoute(route)) activeScreen = undefined;
    },

    editAttempted(area: SettingsJourneyArea, settingName: UserSetting): void {
      try {
        if (
          !enabled ||
          !activeScreen ||
          activeScreen.area !== area ||
          activeScreen.actorId !== getActorId() ||
          activeScreen.route !== normalizeRoute(getRoute())
        ) {
          return;
        }
        getLogger().logClickEvent({
          eventName: "settingsEditAttempted",
          parameters: { schemaVersion: "1", area, settingName },
        });
      } catch {
        // An attempt is not a confirmed save, and logging must not affect the save.
      }
    },
  };
};
