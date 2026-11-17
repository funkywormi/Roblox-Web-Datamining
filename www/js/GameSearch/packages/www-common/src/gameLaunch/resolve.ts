import { window } from "@rbx/core-lib/browser";
import type { GameLauncher } from "./launcher";
import type { ParamValue } from "./protocolUrl";
import { getGameLauncher } from "./registry";

// The launches both pages support. Next.js registers the www-common launcher; .NET pages only have
// the GameLaunch bundle's window.Roblox.GameLauncher, which takes positional arguments.
export type PageGameLauncher = Pick<
  GameLauncher,
  | "followPlayerIntoGame"
  | "joinGameInstance"
  | "joinPrivateGame"
  | "joinMultiplayerGame"
  | "editGameInStudio"
>;

type Id = string | number;
type GetPlayOnWeb = () => (() => void) | undefined;

// components/gameLaunch/src/js/gameLauncher.js. It checks guests and adds join attempt ids itself,
// then hands the params to the page's launch interface (protocol handler or the app's bridge).
type DotNetGameLauncher = {
  joinMultiplayerGame: (
    placeId: Id,
    isMembershipLevelOk: boolean,
    isPlayTogetherGame: boolean,
    joinAttemptId?: string,
    joinAttemptOrigin?: string,
    joinData?: { launchData?: string; eventId?: string; getPlayOnWeb?: GetPlayOnWeb },
    referredByPlayerId?: Id,
    isEarlyTesting?: boolean,
  ) => PromiseLike<void> | void;
  joinGameInstance: (
    placeId: Id,
    gameId: Id,
    isMembershipLevelOk: boolean,
    isPlayTogetherGame: boolean,
    joinAttemptId?: string,
    joinAttemptOrigin?: string,
    referredByPlayerId?: Id,
    getPlayOnWeb?: GetPlayOnWeb,
  ) => PromiseLike<void> | void;
  followPlayerIntoGame: (
    userId: Id,
    joinAttemptId?: string,
    joinAttemptOrigin?: string,
  ) => PromiseLike<void> | void;
  joinPrivateGame: (
    placeId: Id,
    accessCode: Id | undefined,
    linkCode: Id | undefined,
    joinAttemptId?: string,
    joinAttemptOrigin?: string,
    getPlayOnWeb?: GetPlayOnWeb,
  ) => PromiseLike<void> | void;
  editGameInStudio: (
    placeId: Id,
    universeId: Id,
    allowUpload: boolean,
    isTeamCreateEnabled?: boolean,
    enableTeamCreatePreemptiveStart?: boolean,
    startTeamTest?: boolean,
    instanceId?: string,
    annotationId?: string,
  ) => void;
};

const id = (value: ParamValue): Id | undefined =>
  typeof value === "string" || typeof value === "number" ? value : undefined;
// Launch params always set these; .NET reads them as given.
const requiredId = (value: ParamValue): Id => id(value) ?? String(value);
const text = (value: ParamValue): string | undefined =>
  typeof value === "string" ? value : undefined;

const toDotNet = (legacy: DotNetGameLauncher): PageGameLauncher => ({
  followPlayerIntoGame: async params => {
    await legacy.followPlayerIntoGame(
      requiredId(params.userId),
      text(params.joinAttemptId),
      text(params.joinAttemptOrigin),
    );
  },
  joinGameInstance: async (params, getPlayOnWeb) => {
    await legacy.joinGameInstance(
      requiredId(params.placeId),
      requiredId(params.gameId),
      true,
      params.isPlayTogetherGame === true,
      text(params.joinAttemptId),
      text(params.joinAttemptOrigin),
      id(params.referredByPlayerId),
      getPlayOnWeb,
    );
  },
  joinPrivateGame: async (params, getPlayOnWeb) => {
    await legacy.joinPrivateGame(
      requiredId(params.placeId),
      id(params.accessCode),
      id(params.linkCode),
      text(params.joinAttemptId),
      text(params.joinAttemptOrigin),
      getPlayOnWeb,
    );
  },
  joinMultiplayerGame: async (params, getPlayOnWeb) => {
    await legacy.joinMultiplayerGame(
      requiredId(params.placeId),
      true,
      params.isPlayTogetherGame === true,
      text(params.joinAttemptId),
      text(params.joinAttemptOrigin),
      { launchData: text(params.launchData), eventId: text(params.eventId), getPlayOnWeb },
      id(params.referredByPlayerId),
      params.isEarlyTesting === "true" || params.isEarlyTesting === true,
    );
  },
  // Team Create is checked in Studio, so share link errors show there, as the .NET callers did.
  editGameInStudio: async params => {
    legacy.editGameInStudio(
      requiredId(params.placeId),
      requiredId(params.universeId),
      true,
      true,
      false,
      params.startTeamTest,
      params.instanceId,
      params.annotationId,
    );
    await Promise.resolve();
  },
});

const getDotNetGameLauncher = (): DotNetGameLauncher | undefined =>
  // window.Roblox is the legacy untyped global boundary.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  (window as unknown as { Roblox?: { GameLauncher?: DotNetGameLauncher } } | undefined)?.Roblox
    ?.GameLauncher;

/**
 * The page's game launcher: the one the Next.js host registered, or .NET's
 * window.Roblox.GameLauncher with the same params. Null when the page has neither, like a server
 * render. Use this instead of importing `GameLauncher` from the `window.Roblox` barrels.
 */
export const resolveGameLauncher = (): PageGameLauncher | null => {
  const registered = getGameLauncher();
  if (registered != null) {
    return registered;
  }
  const legacy = getDotNetGameLauncher();
  return legacy == null ? null : toDotNet(legacy);
};
