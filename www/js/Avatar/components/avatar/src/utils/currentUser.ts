import { userId } from "@rbx/core-scripts/meta/user";

/**
 * Current user's id as a string (empty when signed out), preserving the shape of the legacy
 * `CurrentUser.userId` (a string) that avatar call sites expect.
 *
 * Backed by the modern `@rbx/core-scripts/meta/user` instead of the deprecated
 * `@rbx/legacy-webapp-types/Roblox` barrel — dual-target: the real module on .NET, the SSR-safe
 * `user/shim` on Next.js (aliased in `@rbx/www-nextjs` next.config). `userId()` returns
 * `number | null`, so it is coerced to a string here to keep existing call sites unchanged.
 */
export const getCurrentUserId = (): string => {
  const id = userId();
  return id != null ? String(id) : "";
};
