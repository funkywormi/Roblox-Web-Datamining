/* eslint-disable no-void */
import { useCallback, useEffect, useState } from "react";
import { toDataURL } from "qrcode";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { captureException } from "@rbx/payments/error";
import { trackError } from "../../observability";

type RobuxGifting = {
  handleCopyUrl: () => void;
  handleShareLink: () => void;
  qrImgSrc: string;
};

export function useRobuxGifting(giftingUrl: string): RobuxGifting {
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
      } catch (e) {
        trackError("QRCodeGenerationFailed", null, e);
      }
    }

    if (giftingUrl) {
      void fetchQRCode();
    }
  }, [giftingUrl]);

  const handleCopyUrl = useCallback(() => {
    if (!giftingUrl) {
      return;
    }

    void navigator.clipboard.writeText(giftingUrl);
  }, [giftingUrl]);

  const handleShareLink = useCallback(() => {
    if (!giftingUrl) {
      return;
    }

    const deviceMeta = getDeviceMeta();
    if (deviceMeta?.isIosDevice || deviceMeta?.isAndroidDevice || deviceMeta?.isUniversalApp) {
      navigator.share({ url: giftingUrl }).catch((err: unknown) => {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          captureException(err);
        }
      });
      return;
    }

    window.location.href = `mailto:?body=${encodeURIComponent(giftingUrl)}`;
  }, [giftingUrl]);

  return {
    handleCopyUrl,
    handleShareLink,
    qrImgSrc,
  };
}
