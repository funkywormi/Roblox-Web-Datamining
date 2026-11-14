import { createContext, useContext, type ReactElement, type ReactNode } from 'react';
import { TranslationProviderSCC } from '@rbx/www-common/i18n/scc';
import type { Namespace } from '@rbx/www-common/i18n';
import {
  useItemModelTranslate,
  useItemTranslate,
  usePurchasingTranslate,
  type PurchaseTranslate
} from './useTranslate';

/**
 * Carries a host-injected translator (the Next.js path) down to nested `SelfProvidedTranslate`
 * boundaries so a Next.js host only passes `translate` once at the top of the itemPurchase tree.
 * Only the injected translator flows through here — never the `.NET` composed translate, which is
 * scoped to a single namespace config; propagating that would make a child resolve keys against
 * the wrong namespaces. So on the `.NET` path this stays `undefined` and every boundary
 * self-sources its own correctly-scoped config.
 */
const InjectedTranslateContext = createContext<PurchaseTranslate | undefined>(undefined);

/**
 * Next.js hosts: wrap the itemPurchase tree once, inside the page's next-intl provider, so every
 * boundary reads the page's messages. The page must load all three namespace configs.
 */
export const PurchaseTranslateProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const purchasing = usePurchasingTranslate();
  const item = useItemTranslate();
  const itemModel = useItemModelTranslate();
  const translate: PurchaseTranslate = (key, params) =>
    purchasing(key, params) || item(key, params) || itemModel(key, params);
  return (
    <InjectedTranslateContext.Provider value={translate}>{children}</InjectedTranslateContext.Provider>
  );
};

type FromContextProps = {
  useTranslate: () => PurchaseTranslate;
  render: (translate: PurchaseTranslate) => ReactElement;
};

const FromContext = ({ useTranslate, render }: FromContextProps): ReactElement =>
  render(useTranslate());

export type SelfProvidedTranslateProps = {
  /**
   * Host-supplied translator (the Next.js path — next-intl in `apps/www`, or a migrated avatar).
   * When present we render with it directly: no `window.Roblox` dependency, no provider.
   */
  translate?: PurchaseTranslate;
  /** `component.json` `translations` the `.NET` page seeded, for the self-wrap path. */
  namespaces: readonly Namespace[];
  /** Sources `translate` from the provider below on the self-wrap path. */
  useTranslate: () => PurchaseTranslate;
  render: (translate: PurchaseTranslate) => ReactElement;
};

/**
 * Dual-path translation boundary shared by the itemPurchase surface, mirroring the pattern
 * `BatchBuyPriceContainer` established. `translate` is injectable so the same component works on
 * both platforms:
 *  - Next.js: the host passes `translate` (from next-intl) — no `window.Roblox` dependency. It is
 *    published to `InjectedTranslateContext`, so nested boundaries rendered without their own
 *    `translate` prop (e.g. modals a parent opens internally) inherit it instead of wrongly
 *    falling back to the `.NET` path. A host only needs to inject once at the top of the tree.
 *  - `.NET` / `window.RobloxItemPurchase`: omit it and we self-wrap in `TranslationProviderSCC`
 *    (backed by `window.Roblox.Lang`) and source `translate` there, matching the old
 *    self-sufficient `withTranslations` behavior so external consumers need no provider.
 *
 * The Next.js avatar page injects through `PurchaseTranslateProvider`. A Next.js host must:
 *  1. Inject a translator that covers every itemPurchase namespace (the `*_NAMESPACES` lists in
 *     `useTranslate.ts`). Keys in a missing namespace render blank, e.g. the 2SV purchase flow.
 *  2. Keep subtrees in the same React tree. Context doesn't reach `renderToString` output or a
 *     separate root; those need `translate` passed explicitly. The upsell modals use the portal
 *     host that ItemPurchase renders, so they're covered.
 *  3. Render `ItemPurchase` inside the page's next-intl provider. The upsell service reads its
 *     namespaces from there (see `useUpsellTranslationProvider`).
 */
export const SelfProvidedTranslate = ({
  translate,
  namespaces,
  useTranslate,
  render
}: SelfProvidedTranslateProps): ReactElement => {
  // A host-injected translator reaches nested boundaries through context, so a Next.js host only
  // has to pass `translate` at the top of the tree; descendants inherit it here.
  const injected = translate ?? useContext(InjectedTranslateContext);

  if (injected) {
    return (
      <InjectedTranslateContext.Provider value={injected}>
        {render(injected)}
      </InjectedTranslateContext.Provider>
    );
  }

  // `.NET` / `window.RobloxItemPurchase`: self-wrap in `TranslationProviderSCC` (backed by
  // `window.Roblox.Lang`) and source `translate` there. The composed translate is deliberately
  // NOT published to `InjectedTranslateContext` — it is scoped to `namespaces`, so nested
  // boundaries must self-source their own config rather than inherit this one.
  return (
    <TranslationProviderSCC namespaces={namespaces}>
      <FromContext useTranslate={useTranslate} render={render} />
    </TranslationProviderSCC>
  );
};
