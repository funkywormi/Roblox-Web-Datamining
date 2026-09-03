import ItemPurchaseUpsellService from './itemPurchaseUpsellService/itemPurchaseUpsellService';
import '../../../css/itemPurchaseUpsell/itemPurchaseUpsell.scss';

// This file exposes the ItemPurchaseUpsell Service to the global Roblox object.
// Augment the global `Roblox` interface (the core-scripts stubs declare the other
// window.Roblox services this way) so the registration below type-checks.
declare global {
  interface Roblox {
    ItemPurchaseUpsellService?: ItemPurchaseUpsellService;
  }
}

if (typeof window.Roblox === 'undefined') {
  window.Roblox = {} as Roblox;
}

if (typeof window.Roblox.ItemPurchaseUpsellService === 'undefined') {
  window.Roblox.ItemPurchaseUpsellService = new ItemPurchaseUpsellService();
}

export default ItemPurchaseUpsellService;
