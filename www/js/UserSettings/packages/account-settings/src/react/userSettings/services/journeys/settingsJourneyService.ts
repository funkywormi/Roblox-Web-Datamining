import { UnifiedLogger, type BaseEvent } from "@rbx/unified-logger";
import environmentUrls from "@rbx/environment-urls";
import { userId } from "@rbx/core-scripts/meta/user";
import { getHashPathFromUrl } from "../../utils/navigationUtils";
import { createSettingsJourneyTracker } from "./createSettingsJourneyTracker";

const createLogger = (): UnifiedLogger => {
  const logger = new UnifiedLogger({
    product: "AccountSettings",
    eventBaseUrl: `https://ecsv2.${environmentUrls.domain}`,
  });
  const setSettingsUrl = (event: BaseEvent): void => {
    // Subpage identity is an enum in parameters; never send URL queries or child IDs.
    event.setURL(`${environmentUrls.websiteUrl}/my/account`);
  };
  logger.events.on("impression", setSettingsUrl);
  logger.events.on("click", setSettingsUrl);
  logger.events.on("session", setSettingsUrl);
  return logger;
};

export default createSettingsJourneyTracker({
  createLogger,
  getActorId: userId,
  getRoute: () => getHashPathFromUrl(window.location.href),
});
