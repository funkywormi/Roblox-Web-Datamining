import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type JSX,
  type ReactNode,
} from "react";
import MetaActionsList from "../components/MetaActionsList";
import ReportNotificationModal from "../components/ReportNotificationModal";
import { getNotificationStreamHost } from "../../notificationStreamData/streamHost";
import { getMuiModalArms } from "../mui/muiModalArms";
import type { TrustedFriendsAcceptModalRequestDetail } from "../clientTriggers/clientTriggerModalBridge";
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

const PassThrough = ({ children }: { children?: ReactNode }) => (
  <React.Fragment>{children}</React.Fragment>
);

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
      if (!getNotificationStreamHost().TrustedFriendsModal) {
        detail.resolve(false);
        return;
      }
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
          submitterId: getNotificationStreamHost().getCurrentUserId(),
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

  const showAbuseReportFor = useCallback(
    (selection: SelectedNotificationState) => {
      setSelectedNotification(selection);
      if (selection.notificationData) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        showAbuseReport(selection.notificationData);
      }
    },
    [setSelectedNotification, showAbuseReport],
  );

  useEffect(() => {
    setNotificationStreamAbuseReportHost(showAbuseReportFor);
    return () => setNotificationStreamAbuseReportHost(null);
  }, [showAbuseReportFor]);

  const StyleProvider: ComponentType<{ children?: ReactNode }> =
    getMuiModalArms()?.StyleProvider ?? PassThrough;
  const { TrustedFriendsModal, TranslationBoundary } = getNotificationStreamHost();

  return (
    <StyleProvider>
      <TranslationBoundary>
        <SelectedNotificationProvider>
          <MetaActionsList
            show={metaActionsVisible}
            closeModal={closeMetaActionsList}
            showAbuseReport={showAbuseReport}
          />
          <ReportNotificationModal isOpen={showReportNotification} closeModal={closeAbuseReport} />
          {trustedFriendsModalPayload && TrustedFriendsModal ? (
            <TrustedFriendsModal
              userId={trustedFriendsModalPayload.userId}
              linkTokens={trustedFriendsModalPayload.linkTokens}
              onClose={handleTrustedFriendsModalClose}
            />
          ) : null}
        </SelectedNotificationProvider>
      </TranslationBoundary>
    </StyleProvider>
  );
};

export default NotificationStreamModalContainer;
