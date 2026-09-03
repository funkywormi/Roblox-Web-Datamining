// TODO: old, migrated code
/* eslint-disable no-invalid-this */
/* eslint-disable prefer-arrow-callback */
import $ from "jquery";
import { UrlParser } from "@rbx/core-scripts/legacy/Roblox";
import GamePlayEvents from "./gamePlayEvents";

function attachHandlers() {
  const allRunningGameInstancesSectionPath = "#rbx-running-games";
  const allrunningGameInstancesJoinServerPath = ".rbx-game-server-item .rbx-game-server-join";
  const runningGameInstancesForFriendsSectionPath = "#rbx-friends-running-games";
  const runningGameInstancesForFriendsJoinServerPath =
    ".rbx-friends-game-server-item .rbx-friends-game-server-join";
  const gameInstancesForVipServersSectionPath = "#game-instances";
  const gameInstancesForVipJoinServerPath =
    "#rbx-vip-servers .rbx-vip-server-item .rbx-vip-server-join";
  const eventsToWatch = "click";

  // Generic visit buttons - game detail
  $("body").on(eventsToWatch, ".VisitButtonPlay, .VisitButtonPlayGLI", function () {
    let context;

    const currentElement = $(this);
    if (
      currentElement.hasClass("VisitButtonPlay") ||
      currentElement.hasClass("VisitButtonPlayGLI")
    ) {
      context = "PlayButton";
    }
    if (context) {
      const placeId = $(this).attr("placeid");
      const referrerId = UrlParser ? UrlParser.getParameterValueByName("rbxp") : null;
      GamePlayEvents.SendGamePlayIntent(context, placeId, referrerId);
    }
  });

  // Generic edit/build buttons - profile or game detail
  $("body").on(eventsToWatch, ".VisitButtonEdit, .VisitButtonEditGLI", function () {
    const placeId = $(this).attr("placeid");
    GamePlayEvents.SendDevelopIntent("Edit", placeId);
  });

  // Game detail page join instance from all running games
  $(allRunningGameInstancesSectionPath).on(
    eventsToWatch,
    allrunningGameInstancesJoinServerPath,
    function () {
      const placeId = $(this).data("placeid");
      if (placeId) {
        GamePlayEvents.SendGamePlayIntent("JoinInstance", placeId);
      }
    },
  );

  // Game detail page join instance from running games that contain friends
  $(runningGameInstancesForFriendsSectionPath).on(
    eventsToWatch,
    runningGameInstancesForFriendsJoinServerPath,
    function () {
      const placeId = $(this).data("placeid");
      if (placeId) {
        GamePlayEvents.SendGamePlayIntent("JoinInstance", placeId);
      }
    },
  );

  // Game detail page join VIPS
  $(gameInstancesForVipServersSectionPath).on(
    eventsToWatch,
    gameInstancesForVipJoinServerPath,
    function () {
      const placeId = $(this).data("placeid");
      if (placeId) {
        GamePlayEvents.SendGamePlayIntent("PrivateServer", placeId);
      }
    },
  );
}

// call this in entry file later.
export default attachHandlers;
