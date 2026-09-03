import { ComponentProps, CSSProperties, useCallback, useContext, useEffect, useState } from "react";
import { ErrorBoundary } from "@sentry/react";
import { useTranslation } from "@rbx/core-scripts/react";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { Button, SheetRoot } from "@rbx/foundation-ui";
import { SendRobuxSheet } from "./modals/SendRobuxSheet";
import { TrackingContext } from "../contexts/TrackingContext";
import { trackCriticalError } from "../observability";
import { useSendRobuxExperiment } from "../hooks/useSendRobuxExperiment";

// Send sheet requires a userId; route unauth clicks to login instead.
const UNAUTH_LOGIN_PATH = "/login";

type SendRobuxButtonProps = {
  translationKey: string;
  className?: string;
  size?: ComponentProps<typeof Button>["size"];
  style?: CSSProperties;
};

export function SendRobuxButton({
  translationKey,
  className,
  size = "Medium",
}: SendRobuxButtonProps) {
  const { translate } = useTranslation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { trackTransferSendImpression, trackTransferSendSheetView } = useContext(TrackingContext);

  const isAuthed = Boolean(authenticatedUser()?.id);
  const {
    isFriendListFilterEnabled,
    isLoading: isExperimentLoading,
    logExposure,
  } = useSendRobuxExperiment(isAuthed);

  const handleSheetChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen) {
        trackTransferSendSheetView();
      }
      setSheetOpen(isOpen);
    },
    [trackTransferSendSheetView],
  );

  useEffect(() => {
    trackTransferSendImpression();
  }, [trackTransferSendImpression]);

  useEffect(() => {
    if (sheetOpen && !isExperimentLoading) {
      logExposure();
    }
  }, [isExperimentLoading, logExposure, sheetOpen]);

  const onError = useCallback((error: unknown) => {
    trackCriticalError("SendRobuxButtonReactCrash", null, error);
  }, []);

  const handleClick = useCallback(() => {
    if (!isAuthed) {
      const returnUrl = `${window.location.pathname}${window.location.search}`;
      window.location.href = `${UNAUTH_LOGIN_PATH}?ReturnUrl=${encodeURIComponent(returnUrl)}`;
      return;
    }
    handleSheetChange(true);
  }, [isAuthed, handleSheetChange]);

  return (
    <ErrorBoundary onError={onError}>
      <Button
        className={className}
        icon="icon-regular-arrow-up-from-line"
        size={size}
        variant="Standard"
        onClick={handleClick}
      >
        {translate(translationKey)}
      </Button>

      <SheetRoot open={sheetOpen} onOpenChange={handleSheetChange}>
        <SendRobuxSheet
          isFriendListFilterEnabled={isFriendListFilterEnabled}
          isExperimentLoading={isExperimentLoading}
        />
      </SheetRoot>
    </ErrorBoundary>
  );
}
