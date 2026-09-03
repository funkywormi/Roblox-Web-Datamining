import { useState } from "react";
import { Divider, Snackbar, Toggle } from "@rbx/foundation-ui";
import AddPlayersDialog from "../components/modals/AddPlayersDialog";
import ChangeNameDialog from "../components/modals/ChangeNameDialog";
import ConfirmationDialog from "../components/modals/ConfirmationDialog";
import JoinLinkSection from "../components/JoinLinkSection";
import ServerMembersSection from "../components/ServerMembersSection";
import ServerDetailsCard from "../components/ServerDetailsCard";
import { useConfigurePrivateServer } from "../hooks/useConfigurePrivateServer";

const ARROW_RIGHT = "\u2192";

const ConfigurePrivateServerContainer = () => {
  const {
    snackbar,
    dismissSnackbar,
    isLoading,
    loadError,
    server,
    thumbnailUrl,
    memberAvatarUrls,
    gameLink,
    gameServersTabLink,
    displayPrivacyDisclaimer,
    privacyRedirectLink,
    updateName,
    toggleServerStatus,
    updateJoinLink,
    toggleFriendsAccess,
    toggleSubscriptionStatus,
    subscriptionConfirmation,
    confirmSubscriptionAction,
    cancelSubscriptionAction,
    addPlayers,
    removePlayer,
    removePlayerConfirmation,
    confirmRemovePlayer,
    cancelRemovePlayer,
    language,
  } = useConfigurePrivateServer();

  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [isAddPlayersDialogOpen, setIsAddPlayersDialogOpen] = useState(false);

  const isInsufficientFundsDialog = subscriptionConfirmation?.type === "insufficientFunds";
  const subscriptionPrice = subscriptionConfirmation?.currentPrice ?? 0;
  const subscriptionShortfall = subscriptionConfirmation?.insufficientAmount ?? 0;

  if (isLoading) {
    return (
      <div className="min-height-full bg-surface-sunken-0 padding-xlarge">
        <div className="flex justify-center items-center padding-xxlarge">
          <div data-testid="loading-spinner" className="spinner spinner-default" />
        </div>
        {snackbar && (
          <Snackbar title={snackbar.message} onClose={dismissSnackbar} shouldAutoDismiss />
        )}
      </div>
    );
  }

  if (loadError || !server) {
    return (
      <div className="min-height-full bg-surface-sunken-0 padding-xlarge">
        <div className="max-width-[970px] margin-x-auto">
          <div className="radius-medium stroke-standard stroke-default bg-surface-100 padding-large flex justify-center">
            <span className="text-body-medium content-default">
              {loadError || language.messageLoadPrivateServerError}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="configure-private-server-page"
      className="min-height-full bg-surface-sunken-0 padding-large"
    >
      <div className="max-width-[970px] margin-x-auto flex flex-col gap-medium">
        {/* Page Header */}
        <div className="flex justify-between items-center padding-bottom-small">
          <h1 className="text-heading-small content-emphasis">
            {language.headingConfigurePrivateServer}
          </h1>
          <a
            className="text-body-medium content-default flex items-center gap-xsmall"
            href={gameServersTabLink}
          >
            {language.actionBackToPrivateServers}
            <span aria-hidden="true">{ARROW_RIGHT}</span>
          </a>
        </div>

        {/* Top section: Server Details */}
        <ServerDetailsCard
          server={server}
          thumbnailUrl={thumbnailUrl}
          gameLink={gameLink}
          language={language}
          onOpenChangeNameDialog={() => {
            setIsNameDialogOpen(true);
          }}
          onToggleSubscriptionStatus={toggleSubscriptionStatus}
        />

        {/* Card 1: Allow Joining */}
        <div className="radius-medium stroke-standard stroke-default bg-surface-100 padding-large flex flex-col gap-medium">
          <div className="flex justify-between items-center">
            <span className="text-title-large content-emphasis">{language.labelAllowJoining}</span>
            <Toggle
              isChecked={server.active && !server.subscription.expired}
              onCheckedChange={() => {
                toggleServerStatus();
              }}
              aria-label={language.labelAllowJoining}
              placement="Start"
              size="Medium"
              isDisabled={server.subscription.expired}
            />
          </div>

          {!displayPrivacyDisclaimer ? (
            <p className="text-body-large content-default">
              {language.descriptionPrivateServerStatus}
            </p>
          ) : (
            <p className="text-body-large content-default">
              {language.descriptionUnableToJoinDueToPrivacySettingsPrefix}{" "}
              <a className="text-body-large" href={privacyRedirectLink}>
                {language.labelPrivacySettings}
              </a>
            </p>
          )}
        </div>

        {/* Card 2: Connections Allowed + Server Members + Private Server Link */}
        <div className="radius-medium stroke-standard stroke-default bg-surface-100 padding-large flex flex-col gap-medium">
          {/* Connections Allowed */}
          <div className="flex justify-between items-center">
            <span className="text-title-large content-emphasis">
              {language.labelFriendsAllowed}
            </span>
            <Toggle
              isChecked={server.permissions.friendsAllowed}
              onCheckedChange={() => {
                toggleFriendsAccess();
              }}
              aria-label={language.labelFriendsAllowed}
              placement="Start"
              size="Medium"
              isDisabled={!server.active || displayPrivacyDisclaimer}
            />
          </div>

          <Divider />

          {/* Server Members */}
          <ServerMembersSection
            server={server}
            memberAvatarUrls={memberAvatarUrls}
            displayPrivacyDisclaimer={displayPrivacyDisclaimer}
            addPlayersText={language.actionAddPlayers}
            serverMembersText={language.labelServerMembers}
            noMembersText={language.labelNoMembersAdded}
            onOpenAddPlayersDialog={() => {
              setIsAddPlayersDialogOpen(true);
            }}
            onRemovePlayer={removePlayer}
          />

          <Divider />

          {/* Private Server Link */}
          <JoinLinkSection
            active={server.active}
            joinLink={server.joinLink}
            displayPrivacyDisclaimer={displayPrivacyDisclaimer}
            privateServerLinkText={language.labelPrivateServerLink}
            generateText={language.actionGenerate}
            regenerateText={language.actionRegenerateJoinLink}
            joinGameLinkText={language.labelJoinGameLink}
            privacySettingsText={language.labelPrivacySettings}
            privacyDisclaimerText={language.descriptionUnableToShareLinkPrivacySettingsPrefix}
            privacyRedirectLink={privacyRedirectLink}
            onUpdateJoinLink={updateJoinLink}
          />
        </div>
      </div>

      <ChangeNameDialog
        open={isNameDialogOpen}
        privateServerName={server.name}
        title={language.headingChangePrivateServerName}
        placeholder={language.labelChangePrivateServerNamePlaceholder}
        changeActionText={language.actionChangeName}
        cancelActionText={language.actionCancel}
        nameChangeErrorText={language.messageNameChangeError}
        onOpenChange={setIsNameDialogOpen}
        onSubmit={updateName}
      />

      <AddPlayersDialog
        open={isAddPlayersDialogOpen}
        serverMembers={server.permissions.users}
        addActionText={language.actionAdd}
        cancelActionText={language.actionCancel}
        title={language.actionAddPlayers}
        searchLabel={language.labelSearchForPlayers}
        addAtLeastOneText={language.messageAddAtLeastOnePlayer}
        userAlreadyInvitedText={language.messageUserAlreadyInvited}
        unableToAddAnyUsersText={language.labelUnableToAddAnyUsers}
        unableToAddNonFriendsText={language.labelUnableToAddNonFriends}
        unableToAddSpecificUserText={language.labelUnableToAddSpecificUser}
        maxPlayersText={language.messageMaxPlayersAdded}
        onOpenChange={setIsAddPlayersDialogOpen}
        onSubmit={addPlayers}
      />

      <ConfirmationDialog
        open={Boolean(subscriptionConfirmation)}
        title={
          isInsufficientFundsDialog
            ? language.headingInsufficientFunds
            : language.headingRenewSubscription
        }
        body={
          isInsufficientFundsDialog
            ? language.messageInsufficientFunds(String(subscriptionShortfall))
            : language.descriptionRenewSubscription({
                privateServerName: server.name,
                gameName: server.game.rootPlace.name,
                lineBreak: "<br /><br />",
                robuxWithIcon: `<span class="icon-robux-16x16"></span>${subscriptionPrice}`,
              })
        }
        bodyHtmlUnsafe={!isInsufficientFundsDialog}
        actionText={isInsufficientFundsDialog ? language.actionBuyRobux : language.actionRenew}
        cancelText={language.actionCancel}
        onOpenChange={open => {
          if (!open) {
            cancelSubscriptionAction();
          }
        }}
        onAction={confirmSubscriptionAction}
      />

      <ConfirmationDialog
        open={Boolean(removePlayerConfirmation)}
        title={language.headingRemovePlayer}
        body={language.labelRemovePlayerPrivateServerBodyMessage(
          removePlayerConfirmation?.displayValue ?? "",
        )}
        actionText={language.actionRemove}
        cancelText={language.actionCancel}
        onOpenChange={open => {
          if (!open) {
            cancelRemovePlayer();
          }
        }}
        onAction={confirmRemovePlayer}
      />

      {snackbar && (
        <Snackbar title={snackbar.message} onClose={dismissSnackbar} shouldAutoDismiss />
      )}
    </div>
  );
};

export default ConfigurePrivateServerContainer;
