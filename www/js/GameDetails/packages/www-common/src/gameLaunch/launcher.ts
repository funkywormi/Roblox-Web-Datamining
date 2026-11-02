import { generateRandomUuid } from "@rbx/core-lib/uuid";
import { currentBrowser } from "../currentBrowser";
import { getAuthTicket, resetClientStatus } from "./api";
import {
  buildPlaceLauncherUrl,
  buildProtocolUrl,
  GameLaunchParams,
  getProtocolNameForEnvironment,
  isStudioLaunchMode,
  LaunchMode,
  ParamValue,
  Params,
  PlaceLauncherRequest,
} from "./protocolUrl";

export type GameLaunchEventName =
  | "startClientAttempted"
  | "startClientSucceeded"
  | "beginInstall"
  | "successfulInstall"
  | "manualDownload";

export type GameLaunchEvent = {
  launchMethod: "Protocol";
  params: GameLaunchParams | Record<string, never>;
};

// What the install dialog gets; empty for a deep link with no place, as on .NET.
export type LaunchDialogParams = GameLaunchEvent["params"];

export type GameLaunchConfig = {
  placeLauncherUrl: string;
  robloxLocale: ParamValue;
  gameLocale: ParamValue;
  playerChannel: string;
  studioChannel: string;
  isDuarAutoOptInEnabled: boolean;
  isDuarOptOutDisabled: boolean;
  isOmitPlayerChannelForWinAndMacEnabled: boolean;
};

export type GameLaunchHost = {
  getConfig: () => GameLaunchConfig;
  getBrowserTrackerId: () => string | false;
  isAuthenticated: () => boolean;
  getUserId: () => number | string | null;
  isWindowsOrMac: () => boolean;
  onEvent: (name: GameLaunchEventName, event: GameLaunchEvent) => void;
  // Shows the install dialog; `launch` retries the same launch from it.
  onLaunchStarted: (params: LaunchDialogParams, launch: () => Promise<void>) => void;
  onLaunchSucceeded: () => void;
  onLaunchFailed: (error: unknown) => void;
  openProtocolUrl?: (url: string) => void;
  // Set when the user starts the installer; the next successful launch logs successfulInstall.
  // Pass one to share the flag with install flows outside this launcher.
  installState?: { get: () => boolean; set: (isInstalling: boolean) => void };
};

export type MultiplayerGameParams = Params & {
  placeId: ParamValue;
  isPlayTogetherGame?: boolean;
  launchData?: ParamValue;
  eventId?: ParamValue;
};
export type FollowPlayerParams = Params & { userId: ParamValue };
export type GameInstanceParams = Params & {
  placeId: ParamValue;
  gameId: ParamValue;
  isPlayTogetherGame?: boolean;
};
export type PrivateGameParams = Params & {
  placeId: ParamValue;
  accessCode?: ParamValue;
  linkCode?: ParamValue;
};
export type PlayTogetherGameParams = Params & { placeId: ParamValue; conversationId: ParamValue };
export type EditGameInStudioParams = {
  placeId: ParamValue;
  universeId: ParamValue;
  startTeamTest?: boolean;
  instanceId?: string;
  annotationId?: string;
};

export type GameLauncher = {
  joinMultiplayerGame: (params: MultiplayerGameParams) => Promise<void>;
  followPlayerIntoGame: (params: FollowPlayerParams) => Promise<void>;
  joinGameInstance: (params: GameInstanceParams) => Promise<void>;
  joinPrivateGame: (params: PrivateGameParams) => Promise<void>;
  playTogetherGame: (params: PlayTogetherGameParams) => Promise<void>;
  openStudio: () => Promise<void>;
  editGameInStudio: (params: EditGameInStudioParams) => Promise<void>;
  tryAssetInStudio: (params: { assetId: ParamValue }) => Promise<void>;
  openPluginInStudio: (params: { pluginId: ParamValue }) => Promise<void>;
  // Opens a roblox:// deep link behind the install dialog.
  startDeepLinkFlow: (deepLinkUrl: string) => void;
  // Same, but the install dialog keeps the place for its referral.
  startGameWithDeepLinkUrl: (deepLinkUrl: string, placeId: ParamValue) => void;
  // Call when the user starts the installer, so the next successful launch logs successfulInstall.
  beginInstall: (params: GameLaunchParams | Record<string, never>) => void;
  manualDownload: () => void;
};

export const withJoinAttemptId = <T extends Params>(
  params: T,
  joinAttemptId?: string,
  joinAttemptOrigin?: string,
): T & { joinAttemptId: string; joinAttemptOrigin?: string } => ({
  ...params,
  joinAttemptId: joinAttemptId ?? generateRandomUuid(),
  ...(joinAttemptOrigin ? { joinAttemptOrigin } : {}),
});

// Kept as a DOM iframe so automated tests can intercept the protocol URL.
export const openProtocolUrlInIframe = (url: string): void => {
  document.querySelector("iframe#gamelaunch")?.remove();
  const iframe = document.createElement("iframe");
  iframe.id = "gamelaunch";
  iframe.className = "hidden";
  iframe.src = url;
  document.body.appendChild(iframe);
  window.dispatchEvent(new Event("ProtocolLaunchStartSelenium"));
};

const createInstallState = () => {
  let isInstalling = false;
  return {
    get: () => isInstalling,
    set: (value: boolean) => {
      isInstalling = value;
    },
  };
};

export const createGameLauncher = (host: GameLaunchHost): GameLauncher => {
  const installState = host.installState ?? createInstallState();
  const openProtocolUrl = host.openProtocolUrl ?? openProtocolUrlInIframe;
  const event = (params: GameLaunchEvent["params"]): GameLaunchEvent => ({
    launchMethod: "Protocol",
    params,
  });

  const startGameFlow = async (params: GameLaunchParams) => {
    try {
      const studio = isStudioLaunchMode(params.launchMode);
      const reset = resetClientStatus();
      let ticket: string | undefined;
      // Studio signs in on its own, so it never gets a ticket.
      if (host.isAuthenticated() && !studio) {
        [ticket] = await Promise.all([getAuthTicket(), reset]);
      } else {
        await reset;
      }
      const studioUrlParams = studio
        ? {
            userId: host.isAuthenticated() ? host.getUserId() : null,
            browser: currentBrowser(),
          }
        : undefined;
      openProtocolUrl(buildProtocolUrl(params, ticket, studioUrlParams));
      host.onLaunchSucceeded();
      host.onEvent("startClientSucceeded", event(params));
      if (installState.get()) {
        host.onEvent("successfulInstall", event(params));
        installState.set(false);
      }
    } catch (error) {
      host.onLaunchFailed(error);
    }
  };

  const startGame = (
    defaults: Omit<GameLaunchParams, "protocolName" | "launchMode">,
    launchMode: LaunchMode = "play",
  ) => {
    const config = host.getConfig();
    const studio = isStudioLaunchMode(launchMode);
    const params: GameLaunchParams = {
      ...defaults,
      protocolName: getProtocolNameForEnvironment(studio ? "roblox-studio" : "roblox-player"),
      launchMode,
      launchTime: Date.now(),
    };
    const { otherParams } = params;
    otherParams.browsertrackerid = host.getBrowserTrackerId();
    otherParams.robloxLocale = config.robloxLocale;
    otherParams.gameLocale = config.gameLocale;
    if (studio) {
      otherParams.channel = config.studioChannel;
    } else if (!config.isOmitPlayerChannelForWinAndMacEnabled || !host.isWindowsOrMac()) {
      otherParams.channel = config.playerChannel;
    }
    if (!studio && config.isDuarAutoOptInEnabled && !otherParams.LaunchExp) {
      otherParams.LaunchExp = config.isDuarOptOutDisabled ? "InApp" : "PreferInApp";
    }

    host.onEvent("startClientAttempted", event(params));
    const flow = startGameFlow(params);
    host.onLaunchStarted(params, () => startGameFlow(params));
    return flow;
  };

  // No auth ticket or success event; the install dialog closes once the client starts.
  const openDeepLink = (deepLinkUrl: string, params: LaunchDialogParams) => {
    const open = () => {
      openProtocolUrl(deepLinkUrl);
    };
    host.onLaunchStarted(params, () => {
      open();
      return Promise.resolve();
    });
    open();
  };

  const placeLauncherUrl = (request: PlaceLauncherRequest, params: Params) =>
    buildPlaceLauncherUrl(
      host.getConfig().placeLauncherUrl,
      request,
      host.getBrowserTrackerId(),
      params,
    );

  return {
    joinMultiplayerGame: params =>
      startGame({
        otherParams: { placelauncherurl: placeLauncherUrl("RequestGame", params) },
        placeId: params.placeId,
        isPlayTogetherGame: params.isPlayTogetherGame === true,
        launchData: params.launchData,
        eventId: params.eventId,
      }),
    followPlayerIntoGame: params =>
      startGame({
        otherParams: { placelauncherurl: placeLauncherUrl("RequestFollowUser", params) },
      }),
    joinGameInstance: params =>
      startGame({
        otherParams: { placelauncherurl: placeLauncherUrl("RequestGameJob", params) },
        placeId: params.placeId,
        isPlayTogetherGame: params.isPlayTogetherGame === true,
      }),
    joinPrivateGame: params =>
      startGame({
        otherParams: { placelauncherurl: placeLauncherUrl("RequestPrivateGame", params) },
        placeId: params.placeId,
      }),
    playTogetherGame: params =>
      startGame({
        otherParams: { placelauncherurl: placeLauncherUrl("RequestPlayTogetherGame", params) },
        placeId: params.placeId,
        conversationId: params.conversationId,
      }),
    openStudio: () => startGame({ otherParams: { avatar: "avatar" } }, "edit"),
    editGameInStudio: ({ placeId, universeId, startTeamTest = false, instanceId, annotationId }) =>
      startGame(
        {
          otherParams: {
            task: startTeamTest ? "StartTeamTest" : "EditPlace",
            placeId,
            universeId,
            ...(!startTeamTest && instanceId ? { targetInstanceId: instanceId } : {}),
            ...(!startTeamTest && annotationId ? { annotationId } : {}),
            avatar: "avatar",
          },
          placeId,
        },
        "edit",
      ),
    tryAssetInStudio: ({ assetId }) =>
      startGame({ otherParams: { assetid: assetId, avatar: "avatar" } }, "asset"),
    openPluginInStudio: ({ pluginId }) =>
      startGame({ otherParams: { pluginid: pluginId, avatar: "avatar" } }, "plugin"),
    startDeepLinkFlow: deepLinkUrl => {
      openDeepLink(deepLinkUrl, {});
    },
    startGameWithDeepLinkUrl: (deepLinkUrl, placeId) => {
      openDeepLink(deepLinkUrl, {
        protocolName: getProtocolNameForEnvironment("roblox-player"),
        launchMode: "play",
        otherParams: {},
        placeId,
      });
    },
    beginInstall: params => {
      host.onEvent("beginInstall", event(params));
      installState.set(true);
    },
    manualDownload: () => {
      host.onEvent("manualDownload", event({}));
    },
  };
};
