import UserHeartbeatScheduler from "./userHeartbeatScheduler";
import guacService from "./services/guacService";

import { activeEvents, inactiveEvents } from "./constants/constants";

export default async function init(): Promise<void> {
  const config = await guacService.loadGuacConfig();
  if (
    config.isEnabled &&
    window.Roblox.CurrentUser?.userId &&
    parseInt(window.Roblox.CurrentUser.userId, 10) % 100 < config.rolloutPercentage
  ) {
    const userHeartbeatScheduler = new UserHeartbeatScheduler(config.intervalTimeMs);

    activeEvents.forEach(eventType => {
      window.addEventListener(eventType, () => {
        userHeartbeatScheduler.onActiveEvent().catch((e: unknown) => {
          console.error(e);
        });
      });
    });

    inactiveEvents.forEach(eventType => {
      window.addEventListener(eventType, () => {
        userHeartbeatScheduler.onInactiveEvent();
      });
    });

    await userHeartbeatScheduler.start();
  }
}
