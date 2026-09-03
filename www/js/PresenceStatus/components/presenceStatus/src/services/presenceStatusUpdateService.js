import { EnvironmentUrls, RealTime } from "@rbx/core-scripts/legacy/Roblox";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import presenceStatusConstants from "../constants/presenceStatusConstants";

const presenceStatusUpdateService = (() => {
  const RTNPresenceTypeToString = ["Invalid", "Offline", "Online", "Studio", "Game"];
  const PresenceAPIPresenceTypeToString = ["Offline", "Online", "Game", "Studio", "Invisible"];

  const presenceRtnComparisonEventName = "presenceRTNComparison";
  const presenceRtnComparisonEventContext = "presenceRTNComparisonContext";

  const lastPresenceUpdateByUserId = new Map();

  function firePresenceEvent(presenceChangesMap) {
    document.dispatchEvent(
      new CustomEvent("Roblox.Presence.Update", { detail: presenceChangesMap }),
    );
  }

  function getPresences(presenceEventsMap) {
    const presenceChangesMap = new Map();
    const invalidMessages = [];
    for (const userId of presenceEventsMap.keys()) {
      const event = presenceEventsMap.get(userId);
      const report = event.PresenceReport;
      if (
        report &&
        (!lastPresenceUpdateByUserId.has(userId) ||
          event.SessionStarted > lastPresenceUpdateByUserId.get(userId))
      ) {
        presenceChangesMap.set(userId, report);
        lastPresenceUpdateByUserId.set(userId, event.SessionStarted);
      } else {
        invalidMessages.push(userId);
      }
    }

    if (invalidMessages.length > 0) {
      const userPresenceUrlConfig = {
        url: `${EnvironmentUrls.presenceApi}/v1/presence/users`,
        withCredentials: true,
      };

      const data = {
        userIds: invalidMessages,
      };

      httpService
        .post(userPresenceUrlConfig, data)
        .then(result => {
          if (result?.data) {
            for (const userPresence of result.data.userPresences) {
              presenceChangesMap.set(userPresence.userId, userPresence);
            }
          }
        })
        .catch(error => {
          console.error(error);
        })
        .finally(() => {
          firePresenceEvent(presenceChangesMap);
        });
    }

    firePresenceEvent(presenceChangesMap);
  }

  function initializeRealTimeSubscriptions() {
    if (RealTime) {
      const realTimeClient = RealTime.Factory.GetClient();
      const { realtimeNotificationType, realtimeEventTypes } = presenceStatusConstants;
      realTimeClient.Subscribe(realtimeNotificationType, data => {
        const presenceEventsMap = new Map();
        data.forEach(each => {
          switch (each.Type) {
            case realtimeEventTypes.presenceChanged:
              presenceEventsMap.set(each.UserId, each);
              break;
            default:
              break;
          }
        });

        presenceStatusUpdateService.getPresences(presenceEventsMap);
      });
    }
  }

  return {
    initializeRealTimeSubscriptions,
    getPresences,
  };
})();

if (authenticatedUser?.isAuthenticated) {
  document.addEventListener("DOMContentLoaded", () => {
    presenceStatusUpdateService.initializeRealTimeSubscriptions();
  });
}
