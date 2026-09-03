const deferredDeeplinkDownloadInstallerContext = "EdpDownloadRobloxInstaller";
const deferredDeeplinkCreateTokenEventName = "tokenAction";
const deferredDeeplinkCreateTokenAction = "create-token-attempt";

const downloadSourceType = {
  Installer: "installer",
  WebGameJoin: "web_game_join",
} as const;

// NOTE: This groupname must match the groupname where the token is redeemed (in this case, game engine), or deeplinks will break.
const deferredDeeplinkGroupName = "deeplink";

export {
  deferredDeeplinkCreateTokenEventName,
  deferredDeeplinkDownloadInstallerContext,
  deferredDeeplinkCreateTokenAction,
  deferredDeeplinkGroupName,
  downloadSourceType,
};
