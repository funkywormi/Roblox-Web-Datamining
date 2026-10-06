import { useState } from "react";
import { useTranslations } from "@rbx/www-common/i18n";
import { Snackbar } from "@rbx/foundation-ui";
import layoutConstants from "../constants/layoutConstants";

export default function PasskeyUpgradeSnackbarInner() {
  const t = useTranslations("Authentication.Passkey");
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <Snackbar
      title={t(layoutConstants.passkeyUpgradeConfirmationKeys.passkeyUpgradeSuccessMessage)}
      onClose={() => {
        setOpen(false);
      }}
      shouldAutoDismiss
    />
  );
}
