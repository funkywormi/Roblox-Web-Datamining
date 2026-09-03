import { useState } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { Snackbar } from "@rbx/foundation-ui";
import layoutConstants from "../constants/layoutConstants";

export default function PasskeyUpgradeSnackbarInner() {
  const { translate } = useTranslation();
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <Snackbar
      title={translate(layoutConstants.passkeyUpgradeConfirmationKeys.passkeyUpgradeSuccessMessage)}
      onClose={() => {
        setOpen(false);
      }}
      shouldAutoDismiss
    />
  );
}
