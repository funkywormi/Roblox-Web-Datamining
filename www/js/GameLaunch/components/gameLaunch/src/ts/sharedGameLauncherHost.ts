import { isMac, isWindows } from "@rbx/core-scripts/meta/device";
import { isAuthenticated, userId } from "@rbx/core-scripts/meta/user";
import { getBrowserTrackerId } from "@rbx/www-common/browser-tracker";
import type {
  GameLaunchEvent,
  GameLaunchEventName,
  GameLaunchHost,
  LaunchDialogParams,
} from "@rbx/www-common/game-launch";

// ProtocolHandlerClientInterface fields; the flags come from data-* attributes, so they're unchecked.
export type ClientInterfaceState = {
  isInstalling: boolean;
  robloxLocale: string;
  gameLocale: string;
  playerChannel: string;
  studioChannel: string;
  isDuarAutoOptInEnabled: unknown;
  isDuarOptOutDisabled: unknown;
  isOmitPlayerChannelForWinAndMacEnabled: unknown;
};

export type SharedGameLauncherDeps = {
  state: ClientInterfaceState;
  getPlaceLauncherBaseUrl: () => string;
  triggerEvent: (name: GameLaunchEventName, event: GameLaunchEvent) => void;
  logToConsole: (message: string) => void;
  showDialog: (params: LaunchDialogParams, launch: () => Promise<void>) => void;
  closeDialog: () => void;
  showLaunchFailureDialog: () => void;
  openProtocolUrl: (url: string) => void;
};

export const createSharedGameLauncherHost = ({
  state,
  getPlaceLauncherBaseUrl,
  triggerEvent,
  logToConsole,
  showDialog,
  closeDialog,
  showLaunchFailureDialog,
  openProtocolUrl,
}: SharedGameLauncherDeps): GameLaunchHost => ({
  getConfig: () => ({
    placeLauncherUrl: getPlaceLauncherBaseUrl(),
    robloxLocale: state.robloxLocale,
    gameLocale: state.gameLocale,
    playerChannel: state.playerChannel,
    studioChannel: state.studioChannel,
    isDuarAutoOptInEnabled: Boolean(state.isDuarAutoOptInEnabled),
    isDuarOptOutDisabled: Boolean(state.isDuarOptOutDisabled),
    isOmitPlayerChannelForWinAndMacEnabled: Boolean(state.isOmitPlayerChannelForWinAndMacEnabled),
  }),
  getBrowserTrackerId,
  isAuthenticated,
  getUserId: userId,
  isWindowsOrMac: () => isWindows() || isMac(),
  onEvent: triggerEvent,
  // One flag shared with the legacy install dialog and download flows.
  installState: {
    get: () => state.isInstalling,
    set: isInstalling => {
      // eslint-disable-next-line no-param-reassign -- state is the legacy ProtocolHandlerClientInterface
      state.isInstalling = isInstalling;
    },
  },
  onLaunchStarted: showDialog,
  onLaunchSucceeded: closeDialog,
  onLaunchFailed: error => {
    console.error(error);
    showLaunchFailureDialog();
  },
  openProtocolUrl: url => {
    logToConsole(`launchProtocolUrl: ${JSON.stringify({ url })}`);
    openProtocolUrl(url);
  },
});
