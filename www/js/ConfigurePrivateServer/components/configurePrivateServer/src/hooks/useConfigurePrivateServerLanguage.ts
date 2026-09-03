import { useTranslation } from "@rbx/core-scripts/legacy/react-utilities";

export const useConfigurePrivateServerLanguage = () => {
  const { translate } = useTranslation();

  const t = (key: string, params?: Record<string, string | number>) => {
    const value = translate(key, params);
    return value || key;
  };

  return {
    headingConfigurePrivateServer: t("Heading.ConfigurePrivateServer"),
    headingChangePrivateServerName: t("Heading.ChangePrivateServerName"),
    headingRemovePlayer: t("Heading.RemovePlayer"),
    actionBackToPrivateServers: t("Action.BackToPrivateServers"),
    actionAddPlayers: t("Action.AddPlayers"),
    actionRegenerateJoinLink: t("Action.RegenerateJoinLink"),
    actionGenerate: t("Action.Generate"),
    actionCancel: t("Action.Cancel"),
    actionAdd: t("Action.Add"),
    actionChangeName: t("Action.ChangeName"),
    actionRemove: t("Action.Remove"),
    actionRenew: t("Action.Renew"),
    actionBuyRobux: t("Action.BuyRobux"),
    labelServerName: t("Label.ServerName"),
    labelGame: t("Label.Game"),
    labelSubscriptionStatus: t("Label.SubscriptionStatus"),
    labelSubscriptionPrice: t("Label.SubscriptionPrice"),
    labelRenewalDate: t("Label.RenewalDate"),
    labelExpirationDate: t("Label.ExpirationDate"),
    labelAllowJoining: t("Label.AllowJoining"),
    labelFriendsAllowed: t("Label.FriendsAllowed.FriendsRename"),
    labelServerMembers: t("Label.ServerMembers"),
    labelNoMembersAdded: t("Label.None"),
    labelPrivateServerLink: t("Label.PrivateServerLink"),
    labelJoinGameLink: t("Label.JoinGameLink"),
    labelPrivacySettings: t("Label.PrivacySettings"),
    labelFree: t("Label.Free"),
    labelSearchForPlayers: t("Label.SearchForPlayers"),
    labelChangePrivateServerNamePlaceholder: t("Label.ChangePrivateServerNamePlaceholder"),
    labelRemovePlayerPrivateServerBodyMessage: (name: string) =>
      t("Label.RemovePlayerPrivateServerBodyMessage", { name }),
    descriptionPrivateServerStatus: t("Description.PrivateServerStatus"),
    descriptionUnableToJoinDueToPrivacySettingsPrefix: t(
      "Description.UnableToJoinDueToPrivacySettingsPrefix",
    ),
    descriptionUnableToShareLinkPrivacySettingsPrefix: t(
      "Description.UnableToShareLinkPrivacySettingsPrefix",
    ),
    messageLoadPrivateServerError: t("Message.LoadPrivateServerError"),
    messageAddAtLeastOnePlayer: t("Message.AddAtLeastOnePlayer"),
    messageNameChangeError: t("Label.NameChangeError"),
    messageUserAlreadyInvited: t("Message.UserAlreadyInvited"),
    messageMaxPlayersAdded: (maxPlayers: number) => t("Message.MaxPlayersAdded", { maxPlayers }),
    labelUnableToAddAnyUsers: t("Label.UnableToAddAnyUsers"),
    labelUnableToAddNonFriends: t("Label.UnableToAddNonFriends"),
    labelUnableToAddSpecificUser: t("Label.UnableToAddSpecificUser"),
    labelChangeNameSuccess: t("Label.ChangeNameSuccess"),
    labelChangeNameError: t("Label.ChangeNameError"),
    labelChangeSubscriptionStatusSuccess: t("Label.ChangeSubscriptionStatusSuccess"),
    labelChangeSubscriptionStatusError: t("Label.ChangeSubscriptionStatusError"),
    labelChangeServerStatusSuccess: t("Label.ChangeServerStatusSuccess"),
    labelChangeServerStatusError: t("Label.ChangeServerStatusError"),
    labelChangeFriendsAllowedSuccess: t("Label.ChangeFriendsAllowedSuccess.FriendsRename"),
    labelChangeFriendsAllowedError: t("Label.ChangeFriendsAllowedError.FriendsRename"),
    labelUpdateJoinGameLinkSuccess: t("Label.UpdateJoinGameLinkSuccess"),
    labelUpdateJoinGameLinkError: t("Label.UpdateJoinGameLinkError"),
    labelAddedPlayersSuccess: t("Label.AddedPlayersSuccess"),
    labelAddedPlayersError: t("Label.AddedPlayersError"),
    labelRemovePlayerSuccess: t("Label.RemovePlayerSuccess"),
    labelRemovePlayerError: t("Label.RemovePlayerError"),
    headingInsufficientFunds: t("Heading.InsufficientFunds"),
    headingRenewSubscription: t("Heading.RenewSubscription"),
    messageInsufficientFunds: (robux: string) => t("Message.InsufficientFunds", { robux }),
    descriptionRenewSubscription: (params: Record<string, string>) =>
      t("Description.RenewSubscription", params),
  };
};
