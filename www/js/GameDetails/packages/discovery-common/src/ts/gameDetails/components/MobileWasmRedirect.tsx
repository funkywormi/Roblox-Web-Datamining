import React, { useEffect, useState } from "react";
import PlayOnWebDialog from "@rbx/app-download/PlayOnWebDialog";
import { useTranslations } from "@rbx/www-common/i18n";

type TMobileWasmRedirectProps = {
  playOnWeb: (() => void) | undefined;
  isCheckingPlayOnWeb: boolean;
};

/**
 * Opens the Play on Web dialog: it checks until Play on Web is known to be available, then offers
 * it. If the check finds it isn't, the dialog closes and the EDP stays as is.
 */
const MobileWasmRedirect = ({
  playOnWeb,
  isCheckingPlayOnWeb,
}: TMobileWasmRedirectProps): React.JSX.Element | null => {
  const tExperienceDetails = useTranslations("Feature.ExperienceDetails");
  const [isDialogClosed, setIsDialogClosed] = useState(false);
  const hasPlayOnWeb = playOnWeb != null;
  // Closes it as if the user had, so a later playability refetch doesn't reopen it.
  useEffect(() => {
    if (!hasPlayOnWeb && !isCheckingPlayOnWeb) {
      setIsDialogClosed(true);
    }
  }, [hasPlayOnWeb, isCheckingPlayOnWeb]);

  // The user closed the dialog, or the check found no Play on Web.
  if (isDialogClosed) {
    return null;
  }
  // The check is done and found no Play on Web.
  if (!hasPlayOnWeb && !isCheckingPlayOnWeb) {
    return null;
  }
  return (
    <PlayOnWebDialog
      title={
        hasPlayOnWeb
          ? tExperienceDetails.dynamic(
              "PlayOnWebModal.Label.PlayInYourBrowser",
              undefined,
              "Play in your browser",
            )
          : tExperienceDetails.dynamic(
              "PlayOnWebModal.Label.CheckingYourDevice",
              undefined,
              "Checking your device...",
            )
      }
      description={
        hasPlayOnWeb
          ? tExperienceDetails.dynamic(
              "PlayOnWebModal.Label.PlayWithoutDownloading",
              undefined,
              "You can play without downloading the app.",
            )
          : undefined
      }
      isChecking={!hasPlayOnWeb}
      onPlayOnWeb={() => playOnWeb?.()}
      onClose={() => setIsDialogClosed(true)}
    />
  );
};

export default MobileWasmRedirect;
