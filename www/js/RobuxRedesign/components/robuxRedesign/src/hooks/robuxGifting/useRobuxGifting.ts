/* eslint-disable no-void */
import { useCallback, useEffect, useState } from "react";
import { toDataURL } from "qrcode";
import { window, navigator } from "@rbx/core-lib/browser";
import { DeviceMeta } from "@rbx/www-common/device/types";
import { trackCounter, trackError } from "../../observability";

type RobuxGifting = {
  handleCopyUrl: () => void;
  handleShareLink: () => void;
  qrImgSrc: string;
};

export function useRobuxGifting(giftingUrl: string, deviceMeta: DeviceMeta): RobuxGifting {
  const [qrImgSrc, setQRImgSrc] = useState("");

  useEffect(() => {
    async function fetchQRCode() {
      try {
        setQRImgSrc(
          await toDataURL(giftingUrl, {
            errorCorrectionLevel: "H",
            margin: 0,
            width: 306,
          }),
        );
        trackCounter("RobuxGiftingQrGenerated");
      } catch (e) {
        trackError("QRCodeGenerationFailed", null, e);
      }
    }

    if (giftingUrl) {
      void fetchQRCode();
    }
  }, [giftingUrl]);

  const handleCopyUrl = useCallback(() => {
    if (navigator === undefined || !giftingUrl) {
      return;
    }

    void navigator.clipboard.writeText(giftingUrl).catch((err: unknown) => {
      trackError("RobuxGiftingCopyFailed", null, err);
    });
  }, [giftingUrl]);

  const handleShareLink = useCallback(() => {
    if (window === undefined || navigator === undefined || !giftingUrl) {
      return;
    }
    const { DOMException } = window;

    if (deviceMeta.isIosDevice || deviceMeta.isAndroidDevice || deviceMeta.isUniversalApp) {
      trackCounter("RobuxGiftingShare", { method: "native" });
      navigator.share({ url: giftingUrl }).catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") {
          trackCounter("RobuxGiftingShareDismissed");
          return;
        }
        trackError("RobuxGiftingShareFailed", null, err);
      });
      return;
    }

    trackCounter("RobuxGiftingShare", { method: "mailto" });
    window.location.href = `mailto:?body=${encodeURIComponent(giftingUrl)}`;
  }, [deviceMeta, giftingUrl]);

  return {
    handleCopyUrl,
    handleShareLink,
    qrImgSrc,
  };
}
