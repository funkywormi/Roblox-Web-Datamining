import { useCallback, useState } from "react";
import { urlService } from "@rbx/core-scripts/legacy/core-utilities";
import { eventComponents, eventSubcomponents } from "../constants/configurePrivateServerConstants";
import { configurePrivateServerService } from "../services/configurePrivateServerService";
import { sendClickEvent, sendShowEvent, toTargetState } from "../utils/privateServerConfigEvents";
import type {
  PrivateServer,
  PrivateServerSubscription,
  PrivateServerUser,
} from "../types/configurePrivateServerTypes";
import type { useConfigurePrivateServerLanguage } from "./useConfigurePrivateServerLanguage";

type Language = ReturnType<typeof useConfigurePrivateServerLanguage>;

export type SubscriptionConfirmationState = {
  type: "insufficientFunds" | "renewSubscription";
  currentStatus: boolean;
  currentPrice: number;
  insufficientAmount?: number;
} | null;

export type RemovePlayerConfirmationState = {
  player: PrivateServerUser;
  displayValue: string;
} | null;

const getSubscriptionModalComponent = ({
  type,
}: NonNullable<SubscriptionConfirmationState>): string =>
  type === "insufficientFunds"
    ? eventComponents.insufficientFundsModal
    : eventComponents.renewSubscriptionModal;

type UseConfigurePrivateServerMutationsParams = {
  privateServerId: string | null;
  server: PrivateServer | null;
  userRobux: number | null;
  language: Language;
  refreshServer: (incomingServer: PrivateServer) => PrivateServer;
  setServer: React.Dispatch<React.SetStateAction<PrivateServer | null>>;
  showSuccess: (message: string) => void;
  showWarning: (message: string) => void;
  toErrorMessage: (error: unknown, fallbackMessage: string) => string;
};

export const useConfigurePrivateServerMutations = ({
  privateServerId,
  server,
  userRobux,
  language,
  refreshServer,
  setServer,
  showSuccess,
  showWarning,
  toErrorMessage,
}: UseConfigurePrivateServerMutationsParams) => {
  const [subscriptionConfirmation, setSubscriptionConfirmation] =
    useState<SubscriptionConfirmationState>(null);
  const [removePlayerConfirmation, setRemovePlayerConfirmation] =
    useState<RemovePlayerConfirmationState>(null);

  const updateName = useCallback(
    async (newName: string) => {
      if (!privateServerId || !server) {
        return;
      }
      sendClickEvent(server, eventComponents.editNameModal, eventSubcomponents.ctaBtn);
      if (newName === server.name) {
        showSuccess(language.labelChangeNameSuccess);
        return;
      }
      try {
        const updated = await configurePrivateServerService.updateServer(privateServerId, {
          name: newName,
        });
        setServer(prev => (prev ? { ...prev, name: updated.name } : prev));
        showSuccess(language.labelChangeNameSuccess);
      } catch (error) {
        throw new Error(toErrorMessage(error, language.labelChangeNameError), { cause: error });
      }
    },
    [
      language.labelChangeNameError,
      language.labelChangeNameSuccess,
      privateServerId,
      server,
      setServer,
      showSuccess,
      toErrorMessage,
    ],
  );

  const toggleServerStatus = useCallback(async () => {
    if (!privateServerId || !server || server.subscription.expired) {
      return;
    }
    const currentStatus = server.active;
    sendClickEvent(server, eventComponents.page, eventSubcomponents.allowJoiningToggle, {
      target_state: toTargetState(!currentStatus),
    });
    try {
      const updated = await configurePrivateServerService.updateServer(privateServerId, {
        active: !currentStatus,
      });
      setServer(prev =>
        prev
          ? refreshServer({
              ...prev,
              active: updated.active,
              joinCode: updated.joinCode,
              link: updated.link,
            })
          : prev,
      );
      showSuccess(language.labelChangeServerStatusSuccess);
    } catch (error) {
      showWarning(toErrorMessage(error, language.labelChangeServerStatusError));
    }
  }, [
    language.labelChangeServerStatusError,
    language.labelChangeServerStatusSuccess,
    privateServerId,
    refreshServer,
    server,
    setServer,
    showSuccess,
    showWarning,
    toErrorMessage,
  ]);

  const updateJoinLink = useCallback(async () => {
    if (!privateServerId || !server) {
      return;
    }
    sendClickEvent(server, eventComponents.page, eventSubcomponents.generateLinkBtn, {
      action: server.joinLink ? "regenerate" : "generate",
    });
    try {
      const updated = await configurePrivateServerService.updateServer(privateServerId, {
        newJoinCode: true,
      });
      setServer(prev =>
        prev
          ? refreshServer({
              ...prev,
              joinCode: updated.joinCode,
              link: updated.link,
            })
          : prev,
      );
      showSuccess(language.labelUpdateJoinGameLinkSuccess);
    } catch (error) {
      showWarning(toErrorMessage(error, language.labelUpdateJoinGameLinkError));
    }
  }, [
    language.labelUpdateJoinGameLinkError,
    language.labelUpdateJoinGameLinkSuccess,
    privateServerId,
    refreshServer,
    server,
    setServer,
    showSuccess,
    showWarning,
    toErrorMessage,
  ]);

  const toggleFriendsAccess = useCallback(
    async (displayPrivacyDisclaimer: boolean) => {
      if (!privateServerId || !server || !server.active || displayPrivacyDisclaimer) {
        return;
      }
      sendClickEvent(server, eventComponents.page, eventSubcomponents.friendsAllowedToggle, {
        target_state: toTargetState(!server.permissions.friendsAllowed),
      });
      try {
        const permissions = await configurePrivateServerService.updatePermissions(privateServerId, {
          friendsAllowed: !server.permissions.friendsAllowed,
        });
        setServer(prev =>
          prev
            ? {
                ...prev,
                permissions,
              }
            : prev,
        );
        showSuccess(language.labelChangeFriendsAllowedSuccess);
      } catch {
        showWarning(language.labelChangeFriendsAllowedError);
      }
    },
    [
      language.labelChangeFriendsAllowedError,
      language.labelChangeFriendsAllowedSuccess,
      privateServerId,
      server,
      setServer,
      showSuccess,
      showWarning,
    ],
  );

  const updateSubscriptionStatus = useCallback(
    async (currentStatus: boolean, currentPrice: number) => {
      if (!privateServerId || !server) {
        return;
      }
      const param = { active: !currentStatus, price: currentPrice };
      try {
        const subscription = await configurePrivateServerService.updateSubscription(
          privateServerId,
          param,
        );
        const applySubscription = (value: PrivateServerSubscription) => {
          setServer(prev =>
            prev
              ? refreshServer({
                  ...prev,
                  subscription: value,
                })
              : prev,
          );
          showSuccess(language.labelChangeSubscriptionStatusSuccess);
        };

        if (subscription.active === param.active) {
          applySubscription(subscription);
          return;
        }

        const refreshed = await configurePrivateServerService.getServer(privateServerId);
        if (refreshed.subscription.active === param.active) {
          applySubscription(refreshed.subscription);
          return;
        }

        window.location.reload();
      } catch (error) {
        showWarning(toErrorMessage(error, language.labelChangeSubscriptionStatusError));
      }
    },
    [
      language.labelChangeSubscriptionStatusError,
      language.labelChangeSubscriptionStatusSuccess,
      privateServerId,
      refreshServer,
      server,
      setServer,
      showSuccess,
      showWarning,
      toErrorMessage,
    ],
  );

  const toggleSubscriptionStatus = useCallback(async () => {
    if (!server?.subscription.canRenew) {
      return;
    }
    const currentStatus = server.subscription.active;
    const currentPrice = server.subscription.price ?? 0;
    sendClickEvent(server, eventComponents.page, eventSubcomponents.subscriptionToggle, {
      target_state: toTargetState(!currentStatus),
    });

    if (currentStatus) {
      await updateSubscriptionStatus(currentStatus, currentPrice);
      return;
    }

    const insufficientRobux = userRobux !== null && currentPrice > userRobux;
    const insufficientAmount = insufficientRobux ? currentPrice - userRobux : undefined;
    const confirmation: NonNullable<SubscriptionConfirmationState> = {
      type: insufficientRobux ? "insufficientFunds" : "renewSubscription",
      currentStatus,
      currentPrice,
      insufficientAmount,
    };
    sendShowEvent(server, getSubscriptionModalComponent(confirmation), { price: currentPrice });
    setSubscriptionConfirmation(confirmation);
  }, [server, updateSubscriptionStatus, userRobux]);

  const confirmSubscriptionAction = useCallback(async () => {
    if (!server || !subscriptionConfirmation) {
      return;
    }
    sendClickEvent(
      server,
      getSubscriptionModalComponent(subscriptionConfirmation),
      eventSubcomponents.ctaBtn,
      { price: subscriptionConfirmation.currentPrice },
    );
    if (subscriptionConfirmation.type === "insufficientFunds") {
      window.open(urlService.getAbsoluteUrl("/Upgrades/Robux.aspx"), "_blank");
      setSubscriptionConfirmation(null);
      return;
    }
    await updateSubscriptionStatus(
      subscriptionConfirmation.currentStatus,
      subscriptionConfirmation.currentPrice,
    );
    setSubscriptionConfirmation(null);
  }, [server, subscriptionConfirmation, updateSubscriptionStatus]);

  const cancelSubscriptionAction = useCallback(() => {
    if (server && subscriptionConfirmation) {
      sendClickEvent(
        server,
        getSubscriptionModalComponent(subscriptionConfirmation),
        eventSubcomponents.cancelBtn,
        { price: subscriptionConfirmation.currentPrice },
      );
    }
    setSubscriptionConfirmation(null);
  }, [server, subscriptionConfirmation]);

  const addPlayers = useCallback(
    async (players: PrivateServerUser[]) => {
      if (!privateServerId || !server || players.length === 0) {
        return;
      }
      sendClickEvent(server, eventComponents.addPlayersModal, eventSubcomponents.ctaBtn, {
        added_count: players.length,
      });
      try {
        const permissions = await configurePrivateServerService.updatePermissions(privateServerId, {
          usersToAdd: players.map(player => player.id.toString()),
        });
        setServer(prev =>
          prev
            ? {
                ...prev,
                permissions,
              }
            : prev,
        );
        showSuccess(language.labelAddedPlayersSuccess);
      } catch (error) {
        showWarning(toErrorMessage(error, language.labelAddedPlayersError));
      }
    },
    [
      language.labelAddedPlayersError,
      language.labelAddedPlayersSuccess,
      privateServerId,
      server,
      setServer,
      showSuccess,
      showWarning,
      toErrorMessage,
    ],
  );

  const requestRemovePlayer = useCallback(
    (player: PrivateServerUser) => {
      if (server) {
        sendClickEvent(server, eventComponents.page, eventSubcomponents.removePlayerBtn);
      }
      const displayValue = player.displayName ?? player.name;
      setRemovePlayerConfirmation({
        player,
        displayValue,
      });
    },
    [server],
  );

  const confirmRemovePlayer = useCallback(async () => {
    if (!privateServerId || !server || !removePlayerConfirmation) {
      return;
    }
    sendClickEvent(server, eventComponents.removePlayersModal, eventSubcomponents.ctaBtn);
    try {
      const permissions = await configurePrivateServerService.updatePermissions(privateServerId, {
        usersToRemove: [removePlayerConfirmation.player.id],
      });
      setServer(prev =>
        prev
          ? {
              ...prev,
              permissions,
            }
          : prev,
      );
      showSuccess(language.labelRemovePlayerSuccess);
    } catch (error) {
      showWarning(toErrorMessage(error, language.labelRemovePlayerError));
    } finally {
      setRemovePlayerConfirmation(null);
    }
  }, [
    language.labelRemovePlayerError,
    language.labelRemovePlayerSuccess,
    privateServerId,
    removePlayerConfirmation,
    server,
    setServer,
    showSuccess,
    showWarning,
    toErrorMessage,
  ]);

  const cancelRemovePlayer = useCallback(() => {
    setRemovePlayerConfirmation(null);
  }, []);

  return {
    updateName,
    toggleServerStatus,
    updateJoinLink,
    toggleFriendsAccess,
    toggleSubscriptionStatus,
    confirmSubscriptionAction,
    cancelSubscriptionAction,
    subscriptionConfirmation,
    addPlayers,
    requestRemovePlayer,
    confirmRemovePlayer,
    cancelRemovePlayer,
    removePlayerConfirmation,
  };
};
