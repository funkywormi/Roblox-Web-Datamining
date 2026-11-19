import environmentUrls from "@rbx/environment-urls";
import { urlService } from "@rbx/core-scripts/legacy/core-utilities";

export const CONFIGURE_PRIVATE_SERVER_WEB_APP_ID = "configure-private-server-web-app";
export const CONFIGURE_PRIVATE_SERVER_CONTAINER_ID = "configure-private-server-container";

export const configurePrivateServerConstants = {
  assetTypeGames: "games",
  webviewServersPath: "servers-section",
  serversTabSuffix: "#!/game-instances",
  queryPrefix: "?privateServerLinkCode=",
  maxPlayers: 50,
  nameChange: {
    minCharacters: 1,
    maxCharacters: 50,
  },
  apiEndpoints: {
    apiMainPath: `${environmentUrls.gamesApi}/v1/vip-servers/`,
    apiUsersSearchPath: `${environmentUrls.usersApi}/v1/users/search`,
    apiVIPServerCanInvitePath: `${environmentUrls.gamesApi}/v1/vip-server/can-invite/`,
    apiUserSettingsGetPath: `${environmentUrls.apiGatewayUrl}/user-settings-api/v1/user-settings`,
    apiUserCurrencyPath: `${environmentUrls.economyApi}/v1/users/{userId}/currency`,
    accountSettingsPageUrl: urlService.getAbsoluteUrl("/my/account#!/privacy"),
  },
} as const;

export const eventComponents = {
  page: "private_server_config",
  editNameModal: "edit_private_server_name_modal",
  addPlayersModal: "add_players_modal",
  removePlayersModal: "remove_players_modal",
  renewSubscriptionModal: "renew_subscription_modal",
  insufficientFundsModal: "insufficient_funds_modal",
} as const;

export const eventSubcomponents = {
  subscriptionToggle: "subscription_toggle",
  allowJoiningToggle: "allow_joining_toggle",
  friendsAllowedToggle: "friends_allowed_toggle",
  editName: "edit_name",
  addPlayersBtn: "add_players_btn",
  removePlayerBtn: "remove_player_btn",
  generateLinkBtn: "generate_private_server_link_btn",
  copyLinkBtn: "copy_private_server_link_btn",
  ctaBtn: "cta_btn",
  cancelBtn: "cancel_btn",
} as const;

export const getPrivateServerIdFromContainer = (): string | null => {
  const container =
    document.getElementById(CONFIGURE_PRIVATE_SERVER_WEB_APP_ID) ??
    document.getElementById(CONFIGURE_PRIVATE_SERVER_CONTAINER_ID);
  return container?.dataset.privateServerId ?? null;
};
