import { document as browserDocument } from "@rbx/core-lib/browser";
import { getDeviceClient } from "@rbx/www-common/device/client";
import type { DeviceType as ClientDeviceType } from "@rbx/www-common/device/types";

/**
 * Device category for the responsive store. `""` means the host published no
 * known category. `getDeviceClient` uses `"unknown"` for that case; this store
 * keeps the empty string so a missing tag does not match a real device.
 */
export type DeviceType = Exclude<ClientDeviceType, "unknown"> | "";

function toStoreDeviceType(value: ClientDeviceType): DeviceType {
  return value === "unknown" ? "" : value;
}

/**
 * Device type for the current document.
 *
 * Uses `getDeviceClient`, which reads `<meta name="device-meta">`. Returns
 * `""` when the tag is absent or its value is not a known category, including
 * during SSR where `document` is undefined.
 */
export function readDeviceType(doc: Document | undefined = browserDocument): DeviceType {
  if (!doc) return "";
  return toStoreDeviceType(getDeviceClient().deviceType);
}
