// Deprecated: new launch code goes in @rbx/www-common/game-launch. See ../../../AGENTS.md.
import ReactDOM from "react-dom";
import $ from "jquery";
import { QueryClientProvider } from "@tanstack/react-query";
import { Endpoints } from "@rbx/core-scripts/legacy/Roblox";
import { queryClient, renderWithErrorBoundary } from "@rbx/core-scripts/react";
import { createGameLauncher } from "@rbx/www-common/game-launch";
import DownloadDialog from "@rbx/app-download/DownloadDialog";
import LaunchFailureDialog from "@rbx/app-download/LaunchFailureDialog";
import { TranslationProviderSCC } from "@rbx/www-common/i18n/scc";
import { translations } from "../../../component.json";
import GameLauncher from "../gameLauncher";
import { getDeferredDeeplinkQueryParams } from "../../ts/deferredDeeplinks/deferredDeeplinkUtilities";
import resolveLaunchContext from "../../ts/deferredDeeplinks/gameJoinDeeplink";
import { createSharedGameLauncherHost } from "../../ts/sharedGameLauncherHost";

// Launches go through the launcher Next.js uses. This keeps the .NET page state and dialogs.
const ProtocolHandlerClientInterface = {
  isInstalling: false,
  robloxLocale: "",
  gameLocale: "",
  studioChannel: "",
  playerChannel: "",
  isDuarAutoOptInEnabled: false,
  isDuarOptOutDisabled: false,
  isJoinAttemptIdEnabled: false,
  isOmitPlayerChannelForWinAndMacEnabled: false,
};

const studioLaunchModes = ["edit", "plugin", "asset"];

function getDialogContainer(id = "react-dialog-container") {
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

// The same dialog Next.js shows. Like Roblox.Dialog it gets its own node, so the install dialog
// stays underneath and that dialog's unmount can't close this one.
function showLaunchFailureDialog() {
  $.modal.close();

  const container = getDialogContainer("react-launch-failure-dialog-container");
  const unmount = () => ReactDOM.unmountComponentAtNode(container);
  renderWithErrorBoundary(
    <TranslationProviderSCC namespaces={translations}>
      <LaunchFailureDialog unmount={unmount} />
    </TranslationProviderSCC>,
    container,
  );
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

function getPlaceLauncherBaseUrl() {
  let absoluteUrl = " ";
  if (Endpoints && Endpoints.Urls) {
    absoluteUrl = Endpoints.getAbsoluteUrl("/Game/PlaceLauncher.ashx");
  }

  // if endpoints are turned off, or if the absolute url resolver returns a relative path, fallback on the old method
  if (absoluteUrl[0] !== "h") {
    absoluteUrl = `http://${window.location.host}/Game/PlaceLauncher.ashx`;
  }
  return absoluteUrl.replace("placelauncher", "PlaceLauncher");
}

async function startDownload(launchContext) {
  const iframe = document.getElementById("downloadInstallerIFrame");
  const downloadUrl = "/download/client";

  // NOTE: This policy is needed for deferred deeplinking from Chrome on Windows. Otherwise, the deeplink URL is wiped from the installer
  iframe.referrerPolicy = "no-referrer";
  const queryParams = await getDeferredDeeplinkQueryParams(
    window.location.toString(),
    launchContext,
  );

  iframe.src = `${downloadUrl}${queryParams}`;
}

function startStudioDownload() {
  const iframe = document.getElementById("downloadInstallerIFrame");
  iframe.src = "/download/studio";
}

function showDialog(gameLaunchParams, launchGame) {
  const container = getDialogContainer();
  const unmount = () => ReactDOM.unmountComponentAtNode(container);
  const studio = studioLaunchModes.includes(gameLaunchParams?.launchMode);
  renderWithErrorBoundary(
    <TranslationProviderSCC namespaces={translations}>
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
              // Play -> Download: carry the game-join intent so the client can rebuild the join
              // after install. Falls back to a plain LinkId deep link when there is no join URL.
              const launchContext = await resolveLaunchContext(
                gameLaunchParams?.otherParams?.placelauncherurl,
                gameLaunchParams?.otherParams?.LaunchExp,
                gameLaunchParams?.referredByPlayerId,
              );
              await startDownload(launchContext);
            }
          }}
          launchGame={async () => await launchGame()}
          unmount={unmount}
        />
      </QueryClientProvider>
    </TranslationProviderSCC>,
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

// Events re-fire on GameLauncher for gameLaunchLogger. The host reads the state above on each
// launch, so the $(document).ready settings below apply.
const launcher = createGameLauncher(
  createSharedGameLauncherHost({
    state: ProtocolHandlerClientInterface,
    getPlaceLauncherBaseUrl,
    triggerEvent: (name, event) => $(GameLauncher).trigger(GameLauncher[`${name}Event`], event),
    logToConsole: message => GameLauncher.gameLaunchLogger?.logToConsole?.(message),
    showDialog: (gameLaunchParams, launch) =>
      ProtocolHandlerClientInterface.showDialog(gameLaunchParams, launch),
    closeDialog: () => $.modal.close(),
    showLaunchFailureDialog,
    openProtocolUrl: setLocationHref,
  }),
);

// attach the functions
Object.assign(ProtocolHandlerClientInterface, {
  // functions
  joinMultiplayerGame: launcher.joinMultiplayerGame,
  followPlayerIntoGame: launcher.followPlayerIntoGame,
  joinGameInstance: launcher.joinGameInstance,
  joinPrivateGame: launcher.joinPrivateGame,
  playTogetherGame: launcher.playTogetherGame,
  openStudio: launcher.openStudio,
  tryAssetInStudio: assetId => launcher.tryAssetInStudio({ assetId }),
  openPluginInStudio: pluginId => launcher.openPluginInStudio({ pluginId }),
  // allowUpload only fed the old Edit.ashx script URL.
  editGameInStudio: (placeId, universeId, _allowUpload, startTeamTest, instanceId, annotationId) =>
    launcher.editGameInStudio({ placeId, universeId, startTeamTest, instanceId, annotationId }),
  startDeepLinkFlow: launcher.startDeepLinkFlow,
  startGameWithDeepLinkUrl: launcher.startGameWithDeepLinkUrl,
  manualDownload,
  attachManualDownloadToLink,
  startDownload,
  setLocationHref, // this is used by automated tests to intercept the protocol handler URL for verification.  Do not remove.
  // test overrides
  showDialog,
  showLaunchFailureDialog,
});

$(document).ready(() => {
  GameLauncher.setGameLaunchInterface(ProtocolHandlerClientInterface);
  const placeLauncherPanel = $("#PlaceLauncherStatusPanel");
  ProtocolHandlerClientInterface.isJoinAttemptIdEnabled = true;
  ProtocolHandlerClientInterface.robloxLocale = placeLauncherPanel.data("protocol-roblox-locale");
  ProtocolHandlerClientInterface.gameLocale = placeLauncherPanel.data("protocol-game-locale");

  const studioChannel = placeLauncherPanel.data("protocol-studio-channel-name");
  if (typeof studioChannel === "string" && studioChannel.toUpperCase() !== "LIVE") {
    ProtocolHandlerClientInterface.studioChannel = studioChannel;
  }

  const playerChannel = placeLauncherPanel.data("protocol-player-channel-name");
  if (typeof playerChannel === "string" && playerChannel.toUpperCase() !== "LIVE") {
    ProtocolHandlerClientInterface.playerChannel = playerChannel;
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
