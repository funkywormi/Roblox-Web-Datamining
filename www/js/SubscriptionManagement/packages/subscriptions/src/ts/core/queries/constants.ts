export const DEFAULT_RETRIES = 3 as number;

/** Query keys for private server queries */
export const privateServerKeys = {
  all: () => ["privateServers", "all"] as const,
  systemSettings: () => ["privateServers", "systemSettings"] as const,
} as const;
