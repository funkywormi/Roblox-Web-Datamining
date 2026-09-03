import $ from "jquery";
import { DeviceMeta } from "@rbx/core-scripts/legacy/Roblox";
import * as GamePlayButton from "@rbx/game-play-button";
import AppHybridClientInterface from "./src/js/win10/appHybridClientInterface";
import AuthenticationChecker from "./src/js/authenticationChecker";
import GameLauncher from "./src/js/gameLauncher";
import GameLaunchLogger from "./src/js/gameLaunchLogger";
import GamePlayEvents from "./src/js/gamePlayEvents";
import GamePlayEventsHandlers from "./src/js/gamePlayEventsHandlers";
import ProtocolHandlerClientInterface from "./src/js/react/protocolHandlerClientInterface";
import "./src/main.scss";
import "./src/main.css";

// Bridge for legacy WebApps that use window.Roblox.PlayButton
const PlayButton = {
  usePlayabilityStatus: GamePlayButton.usePlayabilityStatus,
  PlayabilityStatuses: GamePlayButton.PlayabilityStatus,
  launchGame: GamePlayButton.launchGame,
  launchLogin: GamePlayButton.launchLogin,
  shouldShowUnplayableButton: GamePlayButton.shouldShowUnplayableButton,
  DefaultPlayButton: GamePlayButton.DefaultPlayButton,
  PlayButton: GamePlayButton.PlayButton,
  PurchaseButton: GamePlayButton.PurchaseButton,
  Error: GamePlayButton.UnplayableError,
  ContextualMessage: GamePlayButton.ContextualMessage,
};

Object.assign(window.Roblox, {
  AuthenticationChecker,
  GameLauncher,
  GameLaunchLogger,
  GamePlayEvents,
  ProtocolHandlerClientInterface,
  PlayButton,
});

$(document).ready(() => {
  GamePlayEventsHandlers();
  const device = DeviceMeta();
  if (device.isUWPApp || device.isUniversalApp) {
    AppHybridClientInterface.isJoinAttemptIdEnabled = true;
    window.Roblox.AppHybridClientInterface = AppHybridClientInterface;
    GameLauncher.setGameLaunchInterface(AppHybridClientInterface);
  }
  GameLauncher.setGameLaunchLogger(GameLaunchLogger);
});
