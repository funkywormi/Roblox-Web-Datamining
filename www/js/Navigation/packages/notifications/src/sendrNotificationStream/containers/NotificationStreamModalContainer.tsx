import { StyledEngineProvider } from "@mui/material";
import { useCallback, useEffect, useRef, useState, type JSX } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { CurrentUser } from "Roblox";
import { TrustedFriendsModal } from "@rbx/friends-common";
import { TranslationProvider, queryClient } from "@rbx/core-scripts/react";
import MetaActionsList from "../components/MetaActionsList";
import ReportNotificationModal from "../components/ReportNotificationModal";
import { translations } from "../components/component.json";
import type { TrustedFriendsAcceptModalRequestDetail } from "../clientTriggers/clientTriggerModalBridge";
import { NotificationLocalizationProvider } from "../context/NotificationsLocalization";
import {
  SelectedNotificationState,
  useSelectedNotificationProvider,
} from "../context/SelectedNotification";
import {
  getAbuseReportRevampUrl,
  loadGuacConfigNonThrowing,
} from "../abuseReport/constants/abuseReportConstants";
import { NotificationData } from "../types/NotificationTemplateTypes";
import {
  setNotificationStreamAbuseReportHost,
  setNotificationStreamMetaActionsHost,
  setNotificationStreamTrustedFriendsHost,
} from "../utils/notificationStreamWindowHost";

const NotificationStreamModalContainer = (): JSX.Element => {
  const { SelectedNotificationProvider, setSelectedNotification } =
    useSelectedNotificationProvider();
  const [metaActionsVisible, setMetaActionsVisible] = useState(false);
  const [showReportNotification, setShowReportNotification] = useState(false);
  const [trustedFriendsModalPayload, setTrustedFriendsModalPayload] = useState<{
    userId: number;
    linkTokens?: number[];
  } | null>(null);
  const trustedFriendsResolveRef = useRef<((isSuccess: boolean) => void) | null>(null);
  const openMetaActionsList = useCallback(
    (event: CustomEvent<SelectedNotificationState>): void => {
      setSelectedNotification(event.detail);
      setMetaActionsVisible(true);
    },
    [setSelectedNotification, setMetaActionsVisible],
  );

  const closeMetaActionsList = useCallback(() => {
    setMetaActionsVisible(false);
  }, []);

  const openTrustedFriendsFromBridge = useCallback(
    (detail: TrustedFriendsAcceptModalRequestDetail): void => {
      trustedFriendsResolveRef.current = detail.resolve;
      setTrustedFriendsModalPayload({
        userId: detail.userId,
        linkTokens: detail.linkTokens,
      });
    },
    [],
  );

  useEffect(() => {
    setNotificationStreamMetaActionsHost(openMetaActionsList);
    setNotificationStreamTrustedFriendsHost(openTrustedFriendsFromBridge);
    return () => {
      setNotificationStreamMetaActionsHost(null);
      setNotificationStreamTrustedFriendsHost(null);
    };
  }, [openMetaActionsList, openTrustedFriendsFromBridge]);

  const handleTrustedFriendsModalClose = useCallback((isSuccess: boolean) => {
    trustedFriendsResolveRef.current?.(isSuccess);
    trustedFriendsResolveRef.current = null;
    setTrustedFriendsModalPayload(null);
  }, []);

  const showAbuseReport = useCallback(
    async (notificationData: NotificationData) => {
      const config = await loadGuacConfigNonThrowing();
      if (config.EnableNotification) {
        const url = getAbuseReportRevampUrl({
          targetId: notificationData.id,
          submitterId: CurrentUser.userId,
          abuseVector: "notifications",
        });
        window.location.href = url;
        return;
      }
      setShowReportNotification(true);
    },
    [setShowReportNotification],
  );

  const closeAbuseReport = useCallback(
    () => setShowReportNotification(false),
    [setShowReportNotification],
  );

  useEffect(() => {
    setNotificationStreamAbuseReportHost(showAbuseReport);
    return () => setNotificationStreamAbuseReportHost(null);
  }, [showAbuseReport]);

  return (
    <StyledEngineProvider injectFirst>
      <NotificationLocalizationProvider>
        <SelectedNotificationProvider>
          <MetaActionsList
            show={metaActionsVisible}
            closeModal={closeMetaActionsList}
            showAbuseReport={showAbuseReport}
          />
          <ReportNotificationModal isOpen={showReportNotification} closeModal={closeAbuseReport} />
          <TranslationProvider config={translations}>
            <QueryClientProvider client={queryClient}>
              {trustedFriendsModalPayload ? (
                <TrustedFriendsModal
                  open
                  userId={trustedFriendsModalPayload.userId}
                  linkTokens={trustedFriendsModalPayload.linkTokens}
                  onClose={handleTrustedFriendsModalClose}
                />
              ) : null}
            </QueryClientProvider>
          </TranslationProvider>
        </SelectedNotificationProvider>
      </NotificationLocalizationProvider>
    </StyledEngineProvider>
  );
};

export default NotificationStreamModalContainer;
