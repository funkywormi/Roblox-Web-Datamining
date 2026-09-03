import { useCallback, useEffect, useMemo, useState } from "react";
import { CurrentUser } from "@rbx/core-scripts/legacy/Roblox";
import { urlService } from "@rbx/core-scripts/legacy/core-utilities";
import {
  configurePrivateServerConstants,
  getPrivateServerIdFromContainer,
} from "../constants/configurePrivateServerConstants";
import { configurePrivateServerService } from "../services/configurePrivateServerService";
import { useConfigurePrivateServerLanguage } from "./useConfigurePrivateServerLanguage";
import { useConfigurePrivateServerMutations } from "./useConfigurePrivateServerMutations";
import { usePrivateServerPrivacy } from "./usePrivateServerPrivacy";
import type { PrivateServer } from "../types/configurePrivateServerTypes";

const buildJoinLink = (joinCode?: string, link?: string, gameLink?: string): string => {
  if (link) {
    return link;
  }
  if (!joinCode || !gameLink) {
    return "";
  }
  return `${gameLink}${configurePrivateServerConstants.queryPrefix}${joinCode}`;
};

const toErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (typeof error === "object" && error !== null && "errors" in error) {
    const { errors } = error;
    if (Array.isArray(errors) && errors.length > 0) {
      const first: unknown = errors[0];
      if (typeof first === "object" && first !== null && "userFacingMessage" in first) {
        const { userFacingMessage } = first;
        if (typeof userFacingMessage === "string") {
          return userFacingMessage;
        }
      }
    }
  }
  return fallbackMessage;
};

export type SnackbarState = {
  message: string;
  type: "success" | "warning";
} | null;

export const useConfigurePrivateServer = () => {
  const language = useConfigurePrivateServerLanguage();
  const [snackbar, setSnackbar] = useState<SnackbarState>(null);

  const showSuccess = useCallback((message: string) => {
    setSnackbar({ message, type: "success" });
  }, []);

  const showWarning = useCallback((message: string) => {
    setSnackbar({ message, type: "warning" });
  }, []);

  const dismissSnackbar = useCallback(() => {
    setSnackbar(null);
  }, []);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [server, setServer] = useState<PrivateServer | null>(null);
  const [privateServerId, setPrivateServerId] = useState<string | null>(null);
  const [userRobux, setUserRobux] = useState<number | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [memberAvatarUrls, setMemberAvatarUrls] = useState<Record<number, string>>({});

  const gameLink = useMemo(() => {
    if (!server) {
      return "";
    }
    return urlService.getAbsoluteUrl(
      `/${configurePrivateServerConstants.assetTypeGames}/${server.game.rootPlace.id}`,
    );
  }, [server]);

  const gameServersTabLink = useMemo(() => {
    if (!server) {
      return "";
    }
    const params = new URLSearchParams(window.location.search);
    const serverListId = params.get("serverListId");
    if (serverListId) {
      return urlService.getAbsoluteUrl(
        `/${configurePrivateServerConstants.assetTypeGames}/${configurePrivateServerConstants.webviewServersPath}/${serverListId}`,
      );
    }
    return `${gameLink}${configurePrivateServerConstants.serversTabSuffix}`;
  }, [gameLink, server]);

  const refreshServer = useCallback((incomingServer: PrivateServer): PrivateServer => {
    const normalizedPrice = incomingServer.subscription.price ?? 0;
    return {
      ...incomingServer,
      subscription: {
        ...incomingServer.subscription,
        price: normalizedPrice,
      },
      joinLink: buildJoinLink(
        incomingServer.joinCode,
        incomingServer.link,
        urlService.getAbsoluteUrl(
          `/${configurePrivateServerConstants.assetTypeGames}/${incomingServer.game.rootPlace.id}`,
        ),
      ),
    };
  }, []);

  const onForceDisableFriendsAllowed = useCallback(async () => {
    if (!privateServerId || !server?.permissions.friendsAllowed) {
      return;
    }
    try {
      const permissions = await configurePrivateServerService.updatePermissions(privateServerId, {
        friendsAllowed: false,
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
  }, [
    language.labelChangeFriendsAllowedError,
    language.labelChangeFriendsAllowedSuccess,
    privateServerId,
    server?.permissions.friendsAllowed,
    showSuccess,
    showWarning,
  ]);

  const { displayPrivacyDisclaimer, privacyRedirectLink } = usePrivateServerPrivacy({
    friendsAllowed: Boolean(server?.permissions.friendsAllowed),
    onForceDisableFriendsAllowed,
  });

  const {
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
  } = useConfigurePrivateServerMutations({
    privateServerId,
    server,
    userRobux,
    language,
    refreshServer,
    setServer,
    showSuccess,
    showWarning,
    toErrorMessage,
  });

  const handleToggleFriendsAccess = useCallback(async () => {
    await toggleFriendsAccess(displayPrivacyDisclaimer);
  }, [displayPrivacyDisclaimer, toggleFriendsAccess]);

  useEffect(() => {
    const id = getPrivateServerIdFromContainer();
    if (!id) {
      setLoadError(language.messageLoadPrivateServerError);
      setIsLoading(false);
      return;
    }
    setPrivateServerId(id);
  }, [language.messageLoadPrivateServerError]);

  useEffect(() => {
    if (!privateServerId) {
      return;
    }
    let isMounted = true;
    const load = async () => {
      try {
        const response = await configurePrivateServerService.getServer(privateServerId);
        if (!isMounted) {
          return;
        }
        setServer(refreshServer(response));
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setLoadError(toErrorMessage(error, language.messageLoadPrivateServerError));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [language.messageLoadPrivateServerError, privateServerId, refreshServer]);

  useEffect(() => {
    if (!server?.game.rootPlace.id) {
      return;
    }
    configurePrivateServerService
      .getPlaceThumbnail(server.game.rootPlace.id)
      .then(url => {
        setThumbnailUrl(url);
      })
      .catch(() => {
        setThumbnailUrl(null);
      });
  }, [server?.game.rootPlace.id]);

  useEffect(() => {
    const users = server?.permissions.users;
    if (!users || users.length === 0) {
      setMemberAvatarUrls({});
      return;
    }
    const userIds = users.map(user => user.id);
    configurePrivateServerService
      .getUserHeadshots(userIds)
      .then(setMemberAvatarUrls)
      .catch(() => {
        setMemberAvatarUrls({});
      });
  }, [server?.permissions.users]);

  useEffect(() => {
    if (!CurrentUser?.userId) {
      return;
    }
    configurePrivateServerService
      .getUserCurrency(CurrentUser.userId)
      .then(data => {
        setUserRobux(data.robux);
      })
      .catch(() => {
        setUserRobux(null);
      });
  }, []);

  return {
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
    toggleFriendsAccess: handleToggleFriendsAccess,
    toggleSubscriptionStatus,
    subscriptionConfirmation,
    confirmSubscriptionAction,
    cancelSubscriptionAction,
    addPlayers,
    removePlayer: requestRemovePlayer,
    removePlayerConfirmation,
    confirmRemovePlayer,
    cancelRemovePlayer,
    language,
  };
};
