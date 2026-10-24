import { ComponentProps, CSSProperties, useCallback, useContext, useEffect, useState } from "react";
import { ErrorBoundary } from "@sentry/react";
import { getCurrentUser } from "@rbx/www-common/user";
import { Button, SheetRoot } from "@rbx/foundation-ui";
import { useFullKeyTranslations } from "@rbx/www-common/i18n";
import { window } from "@rbx/core-lib/browser";
import { SendRobuxSheet } from "./modals/SendRobuxSheet";
import { TrackingContext } from "../contexts/TrackingContext";
import { trackCriticalError } from "../observability";

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
  const { translateFullKey } = useFullKeyTranslations();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { trackTransferSendImpression, trackTransferSendSheetView } = useContext(TrackingContext);

  const isAuthed = Boolean(getCurrentUser()?.id);

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

  const onError = useCallback((error: unknown) => {
    trackCriticalError("SendRobuxButtonReactCrash", null, error);
  }, []);

  const handleClick = useCallback(() => {
    if (!isAuthed) {
      if (window === undefined) {
        return;
      }

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
        {translateFullKey(translationKey)}
      </Button>

      <SheetRoot open={sheetOpen} onOpenChange={handleSheetChange}>
        <SendRobuxSheet />
      </SheetRoot>
    </ErrorBoundary>
  );
}
