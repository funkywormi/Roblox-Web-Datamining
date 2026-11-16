import React, { useEffect, useState } from "react";
import PlayOnWebDialog from "@rbx/app-download/PlayOnWebDialog";
import { useTranslations } from "@rbx/www-common/i18n";

// How long after load Play on Web can still become available, which covers the device check.
const PLAY_ON_WEB_WAIT_MS = 6000;

type TMobileWasmRedirectProps = {
  playOnWeb: (() => void) | undefined;
};

/**
 * Opens the Play on Web dialog: it checks until Play on Web becomes available, then offers it.
 * If it isn't available by the end of the wait, the dialog closes and the EDP stays as is.
 */
const MobileWasmRedirect = ({ playOnWeb }: TMobileWasmRedirectProps): React.JSX.Element | null => {
  const tExperienceDetails = useTranslations("Feature.ExperienceDetails");
  const [isWaiting, setIsWaiting] = useState(true);
  useEffect(() => {
    const timeout = setTimeout(setIsWaiting, PLAY_ON_WEB_WAIT_MS, false);
    return () => clearTimeout(timeout);
  }, []);

  const [hasOfferedPlayOnWeb, setHasOfferedPlayOnWeb] = useState(false);
  const [isDialogClosed, setIsDialogClosed] = useState(false);
  useEffect(() => {
    if (isWaiting && playOnWeb) {
      setHasOfferedPlayOnWeb(true);
    }
  }, [isWaiting, playOnWeb]);

  // Not only the state, so a Play on Web that's available on the first render skips checking.
  const isOffered = hasOfferedPlayOnWeb || (isWaiting && playOnWeb != null);
  if (isDialogClosed || !(isOffered || isWaiting)) {
    return null;
  }
  return (
    <PlayOnWebDialog
      title={
        isOffered
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
        isOffered
          ? tExperienceDetails.dynamic(
              "PlayOnWebModal.Label.PlayWithoutDownloading",
              undefined,
              "You can play without downloading the app.",
            )
          : undefined
      }
      isChecking={!isOffered}
      onPlayOnWeb={() => playOnWeb?.()}
      onClose={() => setIsDialogClosed(true)}
    />
  );
};

export default MobileWasmRedirect;
