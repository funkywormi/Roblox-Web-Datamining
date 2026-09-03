/**
 * Whether Roblox Plus (Blackbird) subscription is rolled out for this page, from server-rendered
 * HTML: `meta[name="subscription-data"]` with `data-is-enabled="true"`.
 *
 * Logic must stay aligned with `@rbx/core-scripts/meta/subscription` `isEnabled` (e.g. NavLinks,
 * `serverList/App.tsx`); Purchase WebApp does not import that package directly.
 */
export default function isPlusSubscriptionRolloutEnabled(): boolean {
  const metaTag = document.querySelector<HTMLMetaElement>('meta[name="subscription-data"]');
  return metaTag?.dataset?.isEnabled === 'true';
}
