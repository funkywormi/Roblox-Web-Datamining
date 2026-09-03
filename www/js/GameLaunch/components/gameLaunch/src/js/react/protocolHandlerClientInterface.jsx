// Please note: This file depends on RobloxCookies.js being already loaded.
import ReactDOM from "react-dom";
import $ from "jquery";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  Cookies,
  CurrentUser,
  Dialog,
  Endpoints,
  EnvironmentUrls,
  TranslationResourceProvider,
} from "@rbx/core-scripts/legacy/Roblox";
import { getCurrentBrowser } from "@rbx/core-scripts/legacy/core-utilities";
import { isMac, isWindows } from "@rbx/core-scripts/meta/device";
import { queryClient, renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import { translations } from "../../../component.json";
import GameLauncher from "../gameLauncher";
import { getDeferredDeeplinkQueryParams } from "../../ts/deferredDeeplinks/deferredDeeplinkUtilities";
import DownloadDialog from "../../ts/DownloadDialog";
import { resetClientStatus, getAuthTicket } from "../../ts/api";

const ProtocolHandlerClientInterface = {
  isInstalling: false,
  robloxLocale: "",
  gameLocale: "",
  protocolUrlSeparator: "+",
  protocolDetectionEnabled: false,
  avatarParamEnabled: true,
  separateScriptParamsEnabled: false,
  waitTimeBeforeFailure: 300,
  protocolNameForStudio: "roblox-studio",
  protocolNameForClient: "roblox-client",
  logger: null,
  channel: "",
  studioChannel: "",
  playerChannel: "",
  isDuarAutoOptInEnabled: false,
  isDuarOptOutDisabled: false,
  isJoinAttemptIdEnabled: false,
  isOmitPlayerChannelForWinAndMacEnabled: false,
};

const distributorTypes = {
  Global: "Global",
};

const launchModes = {
  edit: "edit",
  plugin: "plugin",
  play: "play",
  build: "build",
  app: "app",
  asset: "asset",
};

function isStudioMode(launchMode) {
  return (
    launchMode === launchModes.edit ||
    launchMode === launchModes.plugin ||
    launchMode === launchModes.asset
  );
}

function getDialogContainer() {
  const id = "react-dialog-container";
  let container = document.getElementById(id);
  if (container) {
    ReactDOM.unmountComponentAtNode(container);
    container.innerHTML = "";
  } else {
    container = document.createElement("div");
    container.id = id;
    document.body.appendChild(container);
  }
  return container;
}

function showLaunchFailureDialog() {
  $.modal.close();

  const translationProvider = new TranslationResourceProvider();
  const visitGameResources = translationProvider.getTranslationResource("Common.VisitGame");
  const controlsResources = translationProvider.getTranslationResource("CommonUI.Controls");
  Dialog.open({
    titleText: visitGameResources.get("Heading.ErrorStartingGame"),
    bodyContent: visitGameResources.get("Response.Dialog.ErrorLaunching"),
    acceptText: controlsResources.get("Action.OK") || "OK",
    showDecline: false,
  });
}

function cleanUpAndLogSuccess(gameLaunchParams) {
  // hide dialog
  $.modal.close();

  // Log success!
  const logParams = {
    launchMethod: "Protocol",
    params: gameLaunchParams,
  };
  $(GameLauncher).trigger(GameLauncher.startClientSucceededEvent, logParams);
  if (ProtocolHandlerClientInterface.isInstalling) {
    $(GameLauncher).trigger(GameLauncher.successfulInstallEvent, logParams);
    ProtocolHandlerClientInterface.isInstalling = false;
  }
}

function setLocationHref(href) {
  let iframe = $("iframe#gamelaunch");
  if (iframe.length > 0) {
    iframe.remove();
  }

  iframe = $("<iframe id='gamelaunch' class='hidden'></iframe>").attr("src", href);
  $("body").append(iframe);
  // for selenium
  const seleniumEvent = new Event("ProtocolLaunchStartSelenium");
  window.dispatchEvent(seleniumEvent);
}

function launchProtocolUrl(gameLaunchParams, authTicket) {
  const studio = isStudioMode(gameLaunchParams?.launchMode);
  const urlSeparator = ProtocolHandlerClientInterface.protocolUrlSeparator;
  let gameLaunchUrl = `${gameLaunchParams.protocolName}:`;
  const urlComponents = [];

  urlComponents.push(1); // protocol version parameter - used if we wish to significantly change the structure of the protocol url
  urlComponents.push(`launchmode:${gameLaunchParams.launchMode}`);

  // Studio will freeze at log-in if passed a guest ticket
  if (
    authTicket &&
    (gameLaunchParams.protocolName !== ProtocolHandlerClientInterface.protocolNameForStudio ||
      authTicket.indexOf("Guest:") !== 0)
  ) {
    urlComponents.push(`gameinfo:${encodeURIComponent(authTicket)}`);
  }

  urlComponents.push(`launchtime:${gameLaunchParams.launchTime}`);

  if (studio && CurrentUser.isAuthenticated) {
    urlComponents.push(`distributorType:${distributorTypes.Global}`);
    urlComponents.push(`userId:${CurrentUser.userId}`);
  }

  if (studio) {
    urlComponents.push(`browser:${getCurrentBrowser()}`);
  }

  $.each(gameLaunchParams.otherParams, (name, value) => {
    if (name === value) {
      // assume if name === value, just add name
      urlComponents.push(name);
    } else {
      urlComponents.push(`${name}:${encodeURIComponent(value)}`);
    }
  });

  gameLaunchUrl += urlComponents.join(urlSeparator);
  GameLauncher.gameLaunchLogger?.logToConsole?.(
    `launchProtocolUrl: ${JSON.stringify({
      url: gameLaunchUrl,
      params: gameLaunchParams,
    })}`,
  );

  // setLocationHref is used so that automated tests can intercept the protocol handler URL for verification.  Do not refactor without checking the tests.
  setLocationHref(gameLaunchUrl);
}

async function startGameFlow(gameLaunchParams) {
  try {
    const studio = isStudioMode(gameLaunchParams?.launchMode);
    const reset = resetClientStatus();
    let ticket;
    if (CurrentUser.isAuthenticated && !studio) {
      [ticket] = await Promise.all([getAuthTicket(), reset]);
    } else {
      await reset;
    }
    launchProtocolUrl(gameLaunchParams, ticket);
    cleanUpAndLogSuccess(gameLaunchParams);
  } catch (e) {
    console.error(e);
    showLaunchFailureDialog();
  }
}

function startGame(gameLaunchDefaultParams) {
  const gameLaunchParams = { ...gameLaunchDefaultParams };
  gameLaunchParams.launchTime = new Date().getTime();
  gameLaunchParams.otherParams.browsertrackerid = Cookies.getBrowserTrackerId();

  gameLaunchParams.otherParams.robloxLocale = ProtocolHandlerClientInterface.robloxLocale;
  gameLaunchParams.otherParams.gameLocale = ProtocolHandlerClientInterface.gameLocale;
  if (gameLaunchParams.protocolName === ProtocolHandlerClientInterface.protocolNameForStudio) {
    gameLaunchParams.otherParams.channel = ProtocolHandlerClientInterface.studioChannel;
  } else if (
    !ProtocolHandlerClientInterface.isOmitPlayerChannelForWinAndMacEnabled ||
    (!isWindows() && !isMac())
  ) {
    gameLaunchParams.otherParams.channel = ProtocolHandlerClientInterface.playerChannel;
  }

  if (
    ProtocolHandlerClientInterface.isDuarAutoOptInEnabled &&
    gameLaunchParams.protocolName === ProtocolHandlerClientInterface.protocolNameForClient &&
    !gameLaunchParams.otherParams.LaunchExp
  ) {
    if (ProtocolHandlerClientInterface.isDuarOptOutDisabled) {
      gameLaunchParams.otherParams.LaunchExp = "InApp";
    } else {
      gameLaunchParams.otherParams.LaunchExp = "PreferInApp";
    }
  }

  // fire startClientAttempted
  $(GameLauncher).trigger(GameLauncher.startClientAttemptedEvent, {
    launchMethod: "Protocol",
    params: gameLaunchParams,
  });
  const ret = startGameFlow(gameLaunchParams);
  ProtocolHandlerClientInterface.showDialog(gameLaunchParams);
  // return the deferred object so we can continue chaining, if desired.
  return ret;
}

function startGameWithDeepLinkUrl(deepLinkUrl, placeId) {
  const gameLaunchParams = {
    launchMode: "play",
    protocolName: ProtocolHandlerClientInterface.protocolNameForClient,
    placeId,
  };
  ProtocolHandlerClientInterface.showDialog(gameLaunchParams);
  setLocationHref(deepLinkUrl);
}

function startDeepLinkFlow(deepLinkUrl) {
  const container = getDialogContainer();
  const unmount = () => ReactDOM.unmountComponentAtNode(container);
  renderWithErrorBoundary(
    <TranslationProvider config={translations}>
      <QueryClientProvider client={queryClient}>
        <DownloadDialog
          download={async () => {
            $(GameLauncher).trigger(GameLauncher.beginInstallEvent, {
              launchMethod: "Protocol",
              params: {},
            });
            ProtocolHandlerClientInterface.isInstalling = true;
            await startDownload();
          }}
          launchGame={async () => {
            setLocationHref(deepLinkUrl);
          }}
          unmount={unmount}
        />
      </QueryClientProvider>
    </TranslationProvider>,
    container,
  );
  setLocationHref(deepLinkUrl);
}

function openDesktopUniversalApp() {
  const DUALaunchParams = {};
  const protocol = ProtocolHandlerClientInterface.protocolNameForClient;
  DUALaunchParams.protocolName = protocol;
  DUALaunchParams.launchTime = new Date().getTime();
  DUALaunchParams.launchMode = launchModes.app;
  DUALaunchParams.otherParams = {};
  DUALaunchParams.otherParams.browsertrackerid = Cookies.getBrowserTrackerId();
  DUALaunchParams.otherParams.robloxLocale = ProtocolHandlerClientInterface.robloxLocale;
  DUALaunchParams.otherParams.gameLocale = ProtocolHandlerClientInterface.gameLocale;
  DUALaunchParams.otherParams.LaunchExp = "InApp";

  // fire startClientAttempted
  $(GameLauncher).trigger(GameLauncher.startClientAttemptedEvent, {
    launchMethod: "Protocol",
    params: DUALaunchParams,
  });
  const ret = startGameFlow(DUALaunchParams);
  ProtocolHandlerClientInterface.showDialog(DUALaunchParams);
  // return the deferred object so we can continue chaining, if desired.
  return ret;
}

function getPlaceLauncherUrl(requestType, otherParams) {
  let absoluteUrl = " ";
  if (Endpoints && Endpoints.Urls) {
    absoluteUrl = `${Endpoints.getAbsoluteUrl("/Game/PlaceLauncher.ashx")}?`;
  }

  // if endpoints are turned off, or if the absolute url resolver returns a relative path, fallback on the old method
  if (absoluteUrl[0] !== "h") {
    const domainUrl = `http://${window.location.host}`;
    const domainPath = "/Game/PlaceLauncher.ashx?";
    absoluteUrl = domainUrl + domainPath;
  }
  absoluteUrl = absoluteUrl.replace("placelauncher", "PlaceLauncher");

  const args = {
    request: requestType,
    browserTrackerId: Cookies.getBrowserTrackerId(),
  };
  $.extend(args, otherParams);
  return absoluteUrl + $.param(args);
}

function getStudioScriptUrl(scriptHandlerName, placeId, universeId, allowUpload) {
  let absoluteUrl = " ";
  if (Endpoints && Endpoints.Urls) {
    absoluteUrl = `${Endpoints.getAbsoluteUrl(`/Game/${scriptHandlerName}`)}?`;
  }

  // if endpoints are turned off, or if the absolute url resolver returns a relative path, fallback on the old method
  if (absoluteUrl[0] !== "h") {
    const domainUrl = `http://${window.location.host}`;
    const domainPath = `/Game/${scriptHandlerName}?`;
    absoluteUrl = domainUrl + domainPath;
  }

  const args = {
    placeId,
    upload: allowUpload ? placeId : "",
    universeId,
    testMode: false,
  };
  return absoluteUrl + $.param(args);
}

function getEditScriptUrl(placeId, universeId, allowUpload) {
  return getStudioScriptUrl("Edit.ashx", placeId, universeId, allowUpload);
}

function openStudio() {
  const otherParams = {};

  if (ProtocolHandlerClientInterface.avatarParamEnabled) {
    otherParams.avatar = "avatar";
  }

  return startGame({
    protocolName: ProtocolHandlerClientInterface.protocolNameForStudio,
    launchMode: "edit",
    otherParams,
  });
}

function tryAssetInStudio(assetId) {
  const otherParams = {
    assetid: assetId,
  };

  if (ProtocolHandlerClientInterface.avatarParamEnabled) {
    otherParams.avatar = "avatar";
  }

  return startGame({
    protocolName: ProtocolHandlerClientInterface.protocolNameForStudio,
    launchMode: "asset",
    otherParams,
  });
}

function openPluginInStudio(pluginId) {
  const otherParams = {
    pluginid: pluginId,
  };

  if (ProtocolHandlerClientInterface.avatarParamEnabled) {
    otherParams.avatar = "avatar";
  }

  startGame({
    protocolName: ProtocolHandlerClientInterface.protocolNameForStudio,
    launchMode: "plugin",
    otherParams,
  });
}

function editGameInStudio(
  placeId,
  universeId,
  allowUpload,
  startTeamTest = false,
  instanceId = "",
  annotationId = "",
) {
  let otherParams;
  if (ProtocolHandlerClientInterface.separateScriptParamsEnabled) {
    otherParams = {
      task: startTeamTest ? "StartTeamTest" : "EditPlace",
      placeId,
      universeId,
    };
    if (!startTeamTest) {
      if (instanceId) {
        otherParams.targetInstanceId = instanceId;
      }
      if (annotationId) {
        otherParams.annotationId = annotationId;
      }
    }
  } else {
    const scriptUrl = getEditScriptUrl(placeId, universeId, allowUpload);
    otherParams = {
      script: scriptUrl,
    };
  }

  if (ProtocolHandlerClientInterface.avatarParamEnabled) {
    otherParams.avatar = "avatar";
  }

  // we currently always pass "avatar" to studio, but in the future it may need to be optional
  startGame({
    protocolName: ProtocolHandlerClientInterface.protocolNameForStudio,
    launchMode: "edit",
    otherParams,
    placeId,
  });
}

// placeLauncherParams has placeId, isPlayTogetherGame, joinAttemptId, joinAttemptOrigin, launchData, eventId
function joinMultiplayerGame(placeLauncherParams) {
  const protocol = ProtocolHandlerClientInterface.protocolNameForClient;

  const launchMode = "play";
  const placeLauncherUrl = getPlaceLauncherUrl("RequestGame", placeLauncherParams);
  const isPlayTogetherGame = placeLauncherParams.isPlayTogetherGame === true;
  const otherParams = {
    placelauncherurl: placeLauncherUrl,
  };
  const startGameParams = {
    protocolName: protocol,
    launchMode,
    otherParams,
    placeId: placeLauncherParams.placeId,
    isPlayTogetherGame,
    launchData: placeLauncherParams.launchData,
    eventId: placeLauncherParams.eventId,
  };

  return startGame(startGameParams);
}

// placeLauncherParams has userId, joinAttemptId, joinAttemptOrigin
function followPlayerIntoGame(placeLauncherParams) {
  const protocol = ProtocolHandlerClientInterface.protocolNameForClient;

  const launchMode = "play";
  const placeLauncherUrl = getPlaceLauncherUrl("RequestFollowUser", placeLauncherParams);
  const params = {
    placelauncherurl: placeLauncherUrl,
  };
  const startGameParams = {
    protocolName: protocol,
    launchMode,
    otherParams: params,
  };

  return startGame(startGameParams);
}

// placeLauncherParams has placeId, gameId, isPlayTogetherGame, joinAttemptId, joinAttemptOrigin
function joinGameInstance(placeLauncherParams) {
  const protocol = ProtocolHandlerClientInterface.protocolNameForClient;

  const launchMode = "play";
  const placeLauncherUrl = getPlaceLauncherUrl("RequestGameJob", placeLauncherParams);
  const isPlayTogetherGame = placeLauncherParams.isPlayTogetherGame === true;
  const params = {
    placelauncherurl: placeLauncherUrl,
  };
  const startGameParams = {
    protocolName: protocol,
    launchMode,
    otherParams: params,
    placeId: placeLauncherParams.placeId,
    isPlayTogetherGame,
  };

  return startGame(startGameParams);
}

// placeLauncherParams has placeId, accessCode, joinAttemptId, joinAttemptOrigin
function joinPrivateGame(placeLauncherParams) {
  const protocol = ProtocolHandlerClientInterface.protocolNameForClient;

  const launchMode = "play";
  const placeLauncherUrl = getPlaceLauncherUrl("RequestPrivateGame", placeLauncherParams);
  const params = {
    placelauncherurl: placeLauncherUrl,
  };
  const startGameParams = {
    protocolName: protocol,
    launchMode,
    otherParams: params,
    placeId: placeLauncherParams.placeId,
  };

  return startGame(startGameParams);
}

// placeLauncherParams has placeId, conversationId, joinAttemptId, joinAttemptOrigin
function playTogetherGame(placeLauncherParams) {
  const protocol = ProtocolHandlerClientInterface.protocolNameForClient;

  const launchMode = "play";
  const placeLauncherUrl = getPlaceLauncherUrl("RequestPlayTogetherGame", placeLauncherParams);
  const otherParams = {
    placelauncherurl: placeLauncherUrl,
  };
  const startGameParams = {
    protocolName: protocol,
    launchMode,
    otherParams,
    placeId: placeLauncherParams.placeId,
    conversationId: placeLauncherParams.conversationId,
  };

  return startGame(startGameParams);
}

async function startDownload() {
  const iframe = document.getElementById("downloadInstallerIFrame");
  const downloadUrl = "/download/client";

  // NOTE: This policy is needed for deferred deeplinking from Chrome on Windows. Otherwise, the deeplink URL is wiped from the installer
  iframe.referrerPolicy = "no-referrer";
  const queryParams = await getDeferredDeeplinkQueryParams(window.location.toString());

  iframe.src = `${downloadUrl}${queryParams}`;
}

function startStudioDownload() {
  const iframe = document.getElementById("downloadInstallerIFrame");
  iframe.src = "/download/studio";
}

function showDialog(gameLaunchParams) {
  const container = getDialogContainer();
  const unmount = () => ReactDOM.unmountComponentAtNode(container);
  const studio = isStudioMode(gameLaunchParams?.launchMode);
  renderWithErrorBoundary(
    <TranslationProvider config={translations}>
      <QueryClientProvider client={queryClient}>
        <DownloadDialog
          download={async () => {
            if (gameLaunchParams.placeId) {
              const refInfoRaw = window.localStorage.getItem("ref_info");
              if (refInfoRaw != null) {
                window.localStorage.removeItem("ref_info");
                let refInfo = {};
                try {
                  refInfo = JSON.parse(atob(refInfoRaw));
                } catch {
                  // do nothing
                }
                // eslint-disable-next-line no-param-reassign
                gameLaunchParams.referredByPlayerId = refInfo[gameLaunchParams.placeId];
              }
            }

            // fire begin install event
            $(GameLauncher).trigger(GameLauncher.beginInstallEvent, {
              launchMethod: "Protocol",
              params: gameLaunchParams,
            });
            ProtocolHandlerClientInterface.isInstalling = true;
            if (studio) {
              startStudioDownload();
              unmount();
            } else {
              await startDownload();
            }
          }}
          launchGame={async () => await startGameFlow(gameLaunchParams)}
          unmount={unmount}
        />
      </QueryClientProvider>
    </TranslationProvider>,
    container,
  );
}

async function manualDownload() {
  $(GameLauncher).trigger(GameLauncher.manualDownloadEvent, {
    launchMethod: "Protocol",
    params: {},
  });
  await startDownload();
}

// TODO: old, migrated code
// eslint-disable-next-line require-await
async function attachManualDownloadToLink() {
  $("body #GameLaunchManualInstallLink").click(async () => {
    await manualDownload();
    return false;
  });
}

// attach the functions
Object.assign(ProtocolHandlerClientInterface, {
  // functions
  joinMultiplayerGame,
  openStudio,
  tryAssetInStudio,
  openPluginInStudio,
  editGameInStudio,
  followPlayerIntoGame,
  joinGameInstance,
  joinPrivateGame,
  playTogetherGame,
  manualDownload,
  attachManualDownloadToLink,
  startDownload,
  setLocationHref, // this is used by automated tests to intercept the protocol handler URL for verification.  Do not remove.
  openDesktopUniversalApp,
  startDeepLinkFlow,
  // test overrides
  showDialog,
  showLaunchFailureDialog,
  cleanUpAndLogSuccess,
  startGameWithDeepLinkUrl,
});

function getProtocolNameForEnvironment(protocolName) {
  switch (EnvironmentUrls.domain) {
    case "sitetest1.robloxlabs.com":
      return `${protocolName}-sitetest1`;
    case "sitetest2.robloxlabs.com":
      return `${protocolName}-sitetest2`;
    case "sitetest3.robloxlabs.com":
      return `${protocolName}-sitetest3`;
    default:
      return protocolName;
  }
}

$(document).ready(() => {
  GameLauncher.setGameLaunchInterface(ProtocolHandlerClientInterface);
  const placeLauncherPanel = $("#PlaceLauncherStatusPanel");
  ProtocolHandlerClientInterface.protocolNameForClient =
    getProtocolNameForEnvironment("roblox-player");
  ProtocolHandlerClientInterface.protocolNameForStudio =
    getProtocolNameForEnvironment("roblox-studio");
  ProtocolHandlerClientInterface.protocolDetectionEnabled = true;
  ProtocolHandlerClientInterface.separateScriptParamsEnabled = true;
  ProtocolHandlerClientInterface.avatarParamEnabled = true;
  ProtocolHandlerClientInterface.isJoinAttemptIdEnabled = true;
  ProtocolHandlerClientInterface.robloxLocale = placeLauncherPanel.data("protocol-roblox-locale");
  ProtocolHandlerClientInterface.gameLocale = placeLauncherPanel.data("protocol-game-locale");
  const channel = placeLauncherPanel.data("protocol-channel-name");
  if (typeof channel === "string" && channel.toUpperCase() !== "LIVE") {
    ProtocolHandlerClientInterface.channel = channel;
  }

  const studioChannel = placeLauncherPanel.data("protocol-studio-channel-name");
  if (typeof studioChannel === "string" && studioChannel.toUpperCase() !== "LIVE") {
    ProtocolHandlerClientInterface.studioChannel = studioChannel;
  }

  const playerChannel = placeLauncherPanel.data("protocol-player-channel-name");
  if (typeof playerChannel === "string" && playerChannel.toUpperCase() !== "LIVE") {
    ProtocolHandlerClientInterface.playerChannel = playerChannel;
  }

  if (
    !ProtocolHandlerClientInterface.logger &&
    typeof window.Roblox.ProtocolHandlerLogger !== "undefined"
  ) {
    ProtocolHandlerClientInterface.logger = window.Roblox.ProtocolHandlerLogger;
  }

  ProtocolHandlerClientInterface.isDuarAutoOptInEnabled = placeLauncherPanel.data(
    "is-duar-auto-opt-in-enabled",
  );

  ProtocolHandlerClientInterface.isDuarOptOutDisabled = placeLauncherPanel.data(
    "is-duar-opt-out-disabled",
  );
  ProtocolHandlerClientInterface.isOmitPlayerChannelForWinAndMacEnabled = placeLauncherPanel.data(
    "is-omit-player-channel-for-win-and-mac-enabled",
  );
});

// todo: set Roblox.ProtocolHandlerClientInterface to be this.
export default ProtocolHandlerClientInterface;
