import { useTranslations, type Namespace, type Translator } from '@rbx/www-common/i18n';

/**
 * The `translate` shim itemPurchase components consume. Signature-compatible with the legacy
 * `withTranslations` `translate` (from `@rbx/core-scripts/react`) it replaces: look a
 * namespace-relative key up across an ordered set of namespaces and return the string, or `''`
 * when no namespace has it — matching `TranslationResource.get`, which returns `resourceMap[key]
 * || ''`, so the `translate(key) || 'English fallback'` guards throughout keep working.
 */
export type PurchaseTranslate = (
  key: string,
  params?: Record<string, unknown>
) => string;

// CI narrows `Namespace` to the generated Next.js locale catalogue (locally it stays `string`),
// which does not yet include these legacy .NET namespaces. They are valid at runtime — the .NET
// page seeds them through `translation.config` and the SCC path seeds them via `component.json` —
// so assert past the narrowed type here, mirroring the SCC entry points (e.g.
// `components/avatarUpsell/entry.tsx`) that cast their `component.json` namespaces the same way.
const asNamespace = (name: string): Namespace =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see note above
  name as unknown as Namespace;

// A `Translator` widened to the runtime string keys this legacy shim forwards. Under CI's narrow
// `Namespace` union, `Translator<Namespace>`'s key type collapses to `never` (the intersection of
// every namespace's keys), so a plain `string` key no longer type-checks. The adaptor solves the
// same problem internally with its own untyped translator; we re-widen once here to match.
type LooseTranslator = {
  (key: string, values?: Record<string, unknown>): string;
  has: (key: string) => boolean;
};

// Namespace order encodes key-lookup precedence: `compose` below picks the FIRST namespace that
// `has` a key, so these are listed highest-precedence first. The legacy HOC derived precedence
// differently — `validateTranslationConfig` produced `[...common, feature]` (feature last) and
// `TranslationResourceProvider.mergeTranslationResources` merged with `Object.assign`, so LATER
// entries won: feature beat every common, and later-declared commons beat earlier ones. To
// reproduce that first-wins here, list the feature namespace first, then the common namespaces in
// REVERSE of their old `translation.config` declaration order.
// Old purchasing config: feature `Purchasing.PurchaseDialog`, common
// `[IAPExperience.PurchaseError, Feature.NotApproved, Feature.RobloxSubscription,
// Authentication.TwoStepVerification]` → precedence high→low below.
const PURCHASING_NAMESPACES: readonly Namespace[] = [
  'Purchasing.PurchaseDialog',
  'Authentication.TwoStepVerification',
  'Feature.RobloxSubscription',
  'Feature.NotApproved',
  'IAPExperience.PurchaseError'
].map(asNamespace);

const ITEM_NAMESPACES: readonly Namespace[] = ['Feature.Item', 'CommonUI.Messages'].map(asNamespace);

const ITEM_MODEL_NAMESPACES: readonly Namespace[] = ['Feature.ItemModel'].map(asNamespace);

/** The `component.json` `translations` a `TranslationProviderSCC` must seed for each config. */
export const purchasingNamespaces: readonly Namespace[] = PURCHASING_NAMESPACES;
export const itemNamespaces: readonly Namespace[] = ITEM_NAMESPACES;
export const itemModelNamespaces: readonly Namespace[] = ITEM_MODEL_NAMESPACES;

const compose =
  (translators: readonly Translator<Namespace>[]): PurchaseTranslate =>
  (key, params) => {
    // Widen once to the runtime string-key signature (see `LooseTranslator`); the legacy shim
    // forwards `null`/`undefined`/nested `params` unchanged so existing call sites keep working.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see LooseTranslator
    const loose = translators as unknown as readonly LooseTranslator[];
    const translator = loose.find(candidate => candidate.has(key));
    return translator ? translator(key, params) : '';
  };

// The `useTranslations` calls below must be spelled out one per line rather than mapped over the
// `*_NAMESPACES` consts: `react-hooks/rules-of-hooks` forbids calling a hook inside a callback.
// Keep each hook list in the SAME order as its const above — that order is the lookup precedence
// (`compose` is first-wins), so the two must stay in sync.

/** `.NET`-path `translate` for `translation.config.purchasingResources`. Requires a provider ancestor. */
export const usePurchasingTranslate = (): PurchaseTranslate =>
  compose([
    // Highest-precedence first — mirrors PURCHASING_NAMESPACES (feature, then commons reversed).
    useTranslations(asNamespace('Purchasing.PurchaseDialog')),
    useTranslations(asNamespace('Authentication.TwoStepVerification')),
    useTranslations(asNamespace('Feature.RobloxSubscription')),
    useTranslations(asNamespace('Feature.NotApproved')),
    useTranslations(asNamespace('IAPExperience.PurchaseError'))
  ]);

/** `.NET`-path `translate` for `translation.config.itemResources`. Requires a provider ancestor. */
export const useItemTranslate = (): PurchaseTranslate =>
  compose([useTranslations(asNamespace('Feature.Item')), useTranslations(asNamespace('CommonUI.Messages'))]);

/** `.NET`-path `translate` for `translation.config.itemModelResources`. Requires a provider ancestor. */
export const useItemModelTranslate = (): PurchaseTranslate =>
  compose([useTranslations(asNamespace('Feature.ItemModel'))]);
