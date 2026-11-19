import React, { useEffect, useState } from "react";
import PlayOnWebDialog from "@rbx/app-download/PlayOnWebDialog";
import { useTranslations } from "@rbx/www-common/i18n";

// How long after load Play on Web can still become available. A device check still running at the
// end extends it.
const PLAY_ON_WEB_WAIT_MS = 6000;

type TMobileWasmRedirectProps = {
  playOnWeb: (() => void) | undefined;
  isCheckingDevice: boolean;
};

/**
 * Opens the Play on Web dialog: it checks until Play on Web becomes available, then offers it.
 * If it isn't available by the end of the wait and the device check, the dialog closes and the EDP
 * stays as is.
 */
const MobileWasmRedirect = ({
  playOnWeb,
  isCheckingDevice,
}: TMobileWasmRedirectProps): React.JSX.Element | null => {
  const tExperienceDetails = useTranslations("Feature.ExperienceDetails");
  const [hasWaited, setHasWaited] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(setHasWaited, PLAY_ON_WEB_WAIT_MS, true);
    return () => clearTimeout(timeout);
  }, []);
  // Ends after the render where the device check finishes, so an answer that makes Play on Web
  // available is still offered.
  const [isWaiting, setIsWaiting] = useState(true);
  useEffect(() => {
    if (hasWaited && !isCheckingDevice) {
      setIsWaiting(false);
    }
  }, [hasWaited, isCheckingDevice]);

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
