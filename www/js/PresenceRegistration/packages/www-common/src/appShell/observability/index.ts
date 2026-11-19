import type { RegistryInput } from "@rbx/observability-framework/schema";

/**
 * Browser counters for the App Shell (nav, presence, realtime, chat, game launch). Next.js and
 * .NET both send them. The "Frontend: AppShell" dashboard is generated from this registry.
 *
 * - `host` is `nextjs` or `dotnet`. The trackers add it, so callers don't pass it.
 * - `page` is the internal page name for pages in `appShellPages` (./host), `other` for the rest.
 *   The trackers add it too.
 * - `appType` is `unknown` for browsers, `android`, `ios`, … for app webviews. The trackers add it,
 *   so webviews (always .NET, not in the experiments) can be left out of comparisons.
 * - `ShellStart` is sent once per page load, including Next.js pages with a custom nav (download,
 *   gift cards). Nav, chat and realtime only load with the default nav, so their counts are much
 *   lower than `ShellStart` on Next.js.
 * - `PageRender` is sent by the Next.js server, so it's in `./server`.
 * - Dashboards use `featureName`. Don't rename it.
 */
export const observabilityRegistry = {
  featureName: "AppShell",
  team: "User > Consumer Apps > Platforms - Web & Backend",
  features: {
    page: {
      counters: [
        { name: "ShellStart", dimensions: ["host", "page", "appType", "auth_state"] },
        { name: "PageHeartbeat", dimensions: ["host", "page", "appType", "beat"] },
      ],
    },
    presence: {
      counters: [{ name: "PresenceHeartbeat", dimensions: ["host", "page", "appType", "outcome"] }],
    },
    navigation: {
      counters: [{ name: "NavLoad", dimensions: ["host", "page", "appType", "outcome"] }],
    },
    realtime: {
      counters: [{ name: "RealtimeStart", dimensions: ["host", "page", "appType", "outcome"] }],
    },
    chat: {
      counters: [{ name: "ChatLoad", dimensions: ["host", "page", "appType", "outcome"] }],
    },
    gameLaunch: {
      counters: [{ name: "GameLaunch", dimensions: ["host", "page", "appType", "outcome"] }],
    },
  },
} as const satisfies RegistryInput;
