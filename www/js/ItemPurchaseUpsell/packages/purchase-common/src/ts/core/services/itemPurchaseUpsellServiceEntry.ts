import { createElement } from 'react';
import { render } from 'react-dom';
import { document } from '@rbx/core-lib/browser';
import ItemPurchaseUpsellService from './itemPurchaseUpsellService/itemPurchaseUpsellService';
import {
  setUpsellModalHostMounter,
  UpsellModalHost
} from './itemPurchaseUpsellService/modals/upsellModalHost';
import '../../../css/itemPurchaseUpsell/itemPurchaseUpsell.css';

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

  // .NET pages have no React tree for the upsell modals to portal from, so give them a root of
  // their own the first time one opens. This is the only React 17-specific (legacy `render`) call;
  // Next.js renders `<UpsellModalHost />` in its tree instead.
  let hostMounted = false;
  setUpsellModalHostMounter(() => {
    if (hostMounted || !document) {
      return;
    }
    hostMounted = true;
    const container = document.createElement('div');
    document.body.appendChild(container);
    render(createElement(UpsellModalHost), container);
  });
}

export default ItemPurchaseUpsellService;
