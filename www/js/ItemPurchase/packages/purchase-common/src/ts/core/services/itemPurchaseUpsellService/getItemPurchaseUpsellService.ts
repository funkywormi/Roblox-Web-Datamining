import { window } from '@rbx/core-lib/browser';
import ItemPurchaseUpsellService, { type UpsellHostTranslations } from './itemPurchaseUpsellService';

// Inlined by Next.js at build time; undefined in the Rspack SCC build.
export const isNextJs = process.env.NEXT_PUBLIC_IS_NEXTJS === 'true';

type RobloxGlobal = { Roblox?: { ItemPurchaseUpsellService?: ItemPurchaseUpsellService } };

let localService: ItemPurchaseUpsellService | undefined;

/**
 * The page's upsell service.
 *
 * On .NET it's the one the ItemPurchaseUpsell bundle registers on `window.Roblox`, so the page
 * keeps a single instance and auto-purchase state; `undefined` until that bundle runs. On Next.js
 * there's no such bundle, so a local instance is created with the host's translations.
 */
export default function getItemPurchaseUpsellService(
  hostTranslations: UpsellHostTranslations
): ItemPurchaseUpsellService | undefined {
  if (!isNextJs) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- untyped .NET global
    const roblox = (window as unknown as RobloxGlobal | undefined)?.Roblox;
    return roblox?.ItemPurchaseUpsellService;
  }
  localService ??= new ItemPurchaseUpsellService(hostTranslations);
  return localService;
}
