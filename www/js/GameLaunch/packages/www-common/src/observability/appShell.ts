import type { RegistryInput } from "@rbx/observability-framework/schema";

/**
 * Counters for the App Shell (nav, presence, realtime, chat, game launch). Next.js and .NET both
 * send them.
 *
 * - Every counter has `host`: `nextjs` or `dotnet`.
 * - `ShellStart` is sent once per page load. Divide by it to get rates.
 * - `PageRender` is only sent by the Next.js server.
 * - Dashboards use `featureName`. Don't rename it.
 */
export const appShellRegistry = {
  featureName: "AppShell",
  team: "User > Consumer Apps > Platforms - Web & Backend",
  features: {
    page: {
      counters: [
        { name: "ShellStart", dimensions: ["auth_state"] },
        { name: "PageRender", dimensions: ["page", "auth_state", "nav"] },
        { name: "PageHeartbeat", dimensions: ["page", "beat"] },
      ],
    },
    presence: {
      counters: [{ name: "PresenceHeartbeat", dimensions: ["outcome"] }],
    },
    navigation: {
      counters: [{ name: "NavLoad", dimensions: ["outcome"] }],
    },
    realtime: {
      counters: [{ name: "RealtimeStart", dimensions: ["outcome"] }],
    },
    chat: {
      counters: [{ name: "ChatLoad", dimensions: ["outcome"] }],
    },
    gameLaunch: {
      counters: [{ name: "GameLaunch", dimensions: ["outcome"] }],
    },
  },
} as const satisfies RegistryInput;

export type AppShellHost = "nextjs" | "dotnet";

type Publish = (name: string, dimensions?: Record<string, string>) => void;

/** Adds the `host` dimension to every counter. */
export const publishWithHost =
  (publish: Publish, host: AppShellHost): Publish =>
  (name, dimensions) => {
    publish(name, { ...dimensions, host });
  };
