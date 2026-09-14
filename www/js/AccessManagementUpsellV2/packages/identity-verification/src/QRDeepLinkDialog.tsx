import React, { ReactNode, useEffect, useState } from "react";
import { Dialog, DialogBody, DialogContent, DialogTitle } from "@rbx/foundation-ui";
import { generateQRCodeData, QRCodeData } from "./qrCode";
import "./QRDeepLinkDialog.css";

// Fixed display size from designs; fits within medium Dialog across
// surfaces. Mirrored by `.iv-qr-svg` in QRDeepLinkDialog.css; keep in
// sync if either changes.
const QR_DISPLAY_SIZE_PX = 176;

// Percentage of logo (including padding) to overall QR code, upper bound.
const LOGO_OUTER_RATIO = 0.25;
// Minimum number of modules for the logo to be visible.
const LOGO_OUTER_MIN_MODULES = 7;
// Target pixel width of the logo frame.
const LOGO_FRAME_TARGET_PX = 5;

type LogoModules = { outer: number; inner: number; glyph: number };

const computeLogoModules = (moduleCount: number): LogoModules => {
  const target = Math.round(moduleCount * LOGO_OUTER_RATIO);
  // Round down to the nearest odd integer so we never exceed
  // ECC recovery budget.
  const outer = Math.max(LOGO_OUTER_MIN_MODULES, target % 2 === 0 ? target - 1 : target);
  // Frame thickness translated from a target pixel width into
  // module-space, then clamped so `inner = outer - 2f` stays >= 5
  // (i.e. `glyph >= 3`) for the smallest QR sizes.
  const targetFrame = Math.round((moduleCount * LOGO_FRAME_TARGET_PX) / QR_DISPLAY_SIZE_PX);
  const maxFrame = Math.floor((outer - 5) / 2);
  const frame = Math.max(1, Math.min(maxFrame, targetFrame));
  const inner = outer - 2 * frame;
  return { outer, inner, glyph: inner - 2 };
};

// Roblox logo path data — copied verbatim from
// `@rbx/core-ui/images/logos/logo_O_light_08292022.svg`. Native viewBox
// is 56×56; we scale to the glyph's module-space size via a
// `<g transform>` when embedding in the QR's coordinate system.
// Inlined to avoid adding a `*.svg` module declaration.
const ROBLOX_LOGO_VIEWBOX_SIZE = 56;
const ROBLOX_LOGO_PATH_D =
  "M11.6763 0L0 44.1659L43.5771 56L55.2533 11.8341L11.6763 0ZM32.0849 35.827L19.9079 32.5185L23.1723 20.1769L35.3542 23.4855L32.0849 35.827Z";

export type QRDeepLinkDialogProps = {
  // Whether the dialog is mounted/visible.
  open: boolean;
  // Called by Foundation's dialog when the user dismisses the modal,
  // defaulting to a no-op.
  onOpenChange: (open: boolean) => void;
  // Pre-built deeplink URL to encode into the QR.
  deeplink: string;
  // Heading shown above the QR code. Also used as the QR's `aria-label`.
  title: string;
  // Body paragraph shown above the QR code.
  description: string;
  // Paragraph shown below the QR code. Plain text or arbitrary JSX
  footer: ReactNode;
  // Visible/aria label for the dialog's close affordance.
  closeAffordance: string;
  // Suppresses the Roblox logo overlay in the QR for readability.
  hideLogo?: boolean;
};

export const QRDeepLinkDialog = ({
  open,
  onOpenChange,
  deeplink,
  title,
  description,
  footer,
  closeAffordance,
  hideLogo = false,
}: QRDeepLinkDialogProps): React.JSX.Element | null => {
  const [qrCode, setQrCode] = useState<QRCodeData | null>(null);

  useEffect(() => {
    try {
      setQrCode(generateQRCodeData(deeplink));
    } catch (err) {
      console.error("Failed to generate QRDeepLinkDialog QR code", err);
      setQrCode(null);
    }
  }, [deeplink]);

  if (qrCode === null) {
    return null;
  }

  const logo = computeLogoModules(qrCode.moduleCount);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      isModal
      size="Medium"
      type="Default"
      hasCloseAffordance
      closeLabel={closeAffordance}
    >
      <DialogContent>
        <DialogBody className="flex flex-col">
          <DialogTitle className="text-heading-small padding-bottom-small">{title}</DialogTitle>
          <p className="text-body-medium">{description}</p>
          <div className="flex justify-center">
            <div className="iv-qr-frame padding-medium margin-y-large">
              <svg
                className="iv-qr-svg"
                viewBox={`0 0 ${qrCode.moduleCount} ${qrCode.moduleCount}`}
                role="img"
                aria-label={title}
              >
                <path d={qrCode.pathData} fill="#000000" />
                {!hideLogo && (
                  <React.Fragment>
                    <rect
                      x={(qrCode.moduleCount - logo.outer) / 2}
                      y={(qrCode.moduleCount - logo.outer) / 2}
                      width={logo.outer}
                      height={logo.outer}
                      fill="#FFFFFF"
                    />
                    <rect
                      className="iv-qr-logo-backdrop"
                      x={(qrCode.moduleCount - logo.inner) / 2}
                      y={(qrCode.moduleCount - logo.inner) / 2}
                      width={logo.inner}
                      height={logo.inner}
                      fill="#000000"
                    />
                    <g
                      transform={`translate(${(qrCode.moduleCount - logo.glyph) / 2} ${
                        (qrCode.moduleCount - logo.glyph) / 2
                      }) scale(${logo.glyph / ROBLOX_LOGO_VIEWBOX_SIZE})`}
                    >
                      <path d={ROBLOX_LOGO_PATH_D} fill="#FFFFFF" />
                    </g>
                  </React.Fragment>
                )}
              </svg>
            </div>
          </div>
          <p className="text-body-medium padding-bottom-small">{footer}</p>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
