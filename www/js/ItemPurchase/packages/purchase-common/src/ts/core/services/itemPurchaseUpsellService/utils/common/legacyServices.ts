import { window } from '@rbx/core-lib/browser';

/** Services other .NET bundles register on `window.Roblox`. Absent on Next.js. */
type LegacyServices = {
  ItemPurchase?: () => { openErrorView: (error: Record<string, unknown>) => void };
};

/** Reads the services at call time, so importing this module doesn't touch `window`. */
export default function getLegacyServices(): LegacyServices {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- untyped .NET global
  return (window as unknown as { Roblox?: LegacyServices } | undefined)?.Roblox ?? {};
}
