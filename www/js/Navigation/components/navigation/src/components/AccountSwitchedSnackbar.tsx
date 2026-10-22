import { useEffect, useState } from "react";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { useTranslations } from "@rbx/www-common/i18n";
import { getItem, removeItem } from "@rbx/core-lib/local-storage";
import "../constants/localStorageRegistry";
import { Snackbar } from "@rbx/foundation-ui";
import layoutConstants from "../constants/layoutConstants";

const { accountSwitchedFlag, accountSwitchedMessage } =
  layoutConstants.accountSwitchConfirmationKeys;

export default function AccountSwitchedSnackbar() {
  const tAlerts = useTranslations("Common.AlertsAndOptions");
  const tFeatures = useTranslations("CommonUI.Features");
  const user = authenticatedUser();
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user == null) {
      return;
    }
    try {
      if (getItem(accountSwitchedFlag)) {
        setSnackbarMessage(tAlerts(accountSwitchedMessage, { accountName: user.name ?? "" }));
        removeItem(accountSwitchedFlag);
      }
    } catch {
      // no op
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (snackbarMessage == null) {
    return null;
  }

  return (
    <Snackbar
      title={snackbarMessage}
      icon="icon-filled-check"
      shouldAutoDismiss
      autoDismissDurationMs={5000}
      onClose={() => {
        setSnackbarMessage(null);
      }}
      closeIconAriaLabel={tFeatures("Action.Close")}
    />
  );
}
