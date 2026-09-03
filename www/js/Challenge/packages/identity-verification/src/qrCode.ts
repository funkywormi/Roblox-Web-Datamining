import { create as createQRCode } from "qrcode";

/**
 * Data about the QR generated from qrcode library. Includes a
 * SVG-`<path>`-style command string for the dark modules, plus
 * the side length of the symbol in modules (to position the logo).
 */
export type QRCodeData = {
  pathData: string;
  moduleCount: number;
};

/**
 * Renders `deeplink` into a QR matrix at error-correction level `H`
 * Equivalent in output to what `qrcode.toString({ type: 'svg' })` emits
 * internally, but assembled here so the caller can render the modules
 * and any overlay (logo, custom shape, etc.) in a single shared `<svg>`.
 */
export const generateQRCodeData = (deeplink: string): QRCodeData => {
  const qr = createQRCode(deeplink, { errorCorrectionLevel: "H" });
  const moduleCount = qr.modules.size;
  let pathData = "";
  for (let row = 0; row < moduleCount; row += 1) {
    for (let col = 0; col < moduleCount; col += 1) {
      if (qr.modules.get(row, col)) {
        pathData += `M${col} ${row}h1v1h-1z`;
      }
    }
  }
  return { pathData, moduleCount };
};
