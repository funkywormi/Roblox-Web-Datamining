import $ from "jquery";
import { EventStream } from "@rbx/core-scripts/legacy/Roblox";

const gamePlayEvents = {
  lastContext: "unknown",
  contextCategories: {
    joinUser: "JoinUser",
  },
};

function getPage() {
  const path = window.location.pathname.toLowerCase();
  const profilePageString = "profile";
  const profileLastIndex = path.lastIndexOf(profilePageString);
  // roundabout way of saying .endsWith since .endsWith is not supported by IE. Surprise surprise!
  if (profileLastIndex !== -1 && path.length === profileLastIndex + profilePageString.length) {
    return profilePageString;
  }
  if (path.indexOf("/develop") === 0) {
    return "develop";
  }

  if (path.indexOf("/discover") === 0) {
    return "games";
  }
  return "gameDetail";
}

function getProperties(placeId, referrerId, joinAttemptId, actionType) {
  return {
    lType: "protocol",
    pid: placeId,
    refuid: referrerId,
    pg: getPage(),
    joinAttemptId,
    ...(actionType != null && { actionType }),
  };
}

function sendEvent(eventName, context, placeId, referrerId, joinAttemptId, actionType) {
  if (context !== null && context !== "" && context !== "unknown") {
    gamePlayEvents.lastContext = context;
  }
  EventStream.SendEvent(
    eventName,
    gamePlayEvents.lastContext,
    getProperties(placeId, referrerId, joinAttemptId, actionType),
  );
}

function sendGamePlayIntent(context, placeId, referrerId, joinAttemptId, actionType) {
  sendEvent("gamePlayIntent", context, placeId, referrerId, joinAttemptId, actionType);
  $(document).trigger("playButton:gamePlayIntent");
}

function sendDevelopIntent(context, placeId) {
  sendEvent("developIntent", context, placeId);
}

function sendInstallBegin(context, placeId) {
  sendEvent("installBegin", context, placeId);
}

function sendInstallSuccess(context, placeId) {
  sendEvent("installSuccess", context, placeId);
}

function sendClientStartAttempt(context, placeId) {
  sendEvent("clientStartAttempt", context, placeId);
}
function sendClientStartSuccessWeb(context, placeId) {
  sendEvent("clientStartSuccessWeb", context, placeId);
}

function sendManualDownloadClick(context, placeId) {
  sendEvent("manualDownload", context, placeId);
}

Object.assign(gamePlayEvents, {
  SendGamePlayIntent: sendGamePlayIntent,
  SendDevelopIntent: sendDevelopIntent,
  SendInstallBegin: sendInstallBegin,
  SendInstallSuccess: sendInstallSuccess,
  SendClientStartAttempt: sendClientStartAttempt,
  SendClientStartSuccessWeb: sendClientStartSuccessWeb,
  SendManualDownloadClick: sendManualDownloadClick,
});

export default gamePlayEvents;
