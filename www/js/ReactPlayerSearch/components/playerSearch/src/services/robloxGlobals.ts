import type {
  RobloxCurrentUser,
  RobloxDeviceMeta,
  RobloxEventStream,
  RobloxGameLauncher,
  RobloxGlobal,
  RobloxGuac,
  RobloxPresence,
  RobloxPresenceProvider,
  RobloxRealTimeClient,
} from "../types/roblox";

const isRobloxGlobal = (value: unknown): value is RobloxGlobal => {
  return typeof value === "object" && value !== null;
};

const getRobloxGlobal = (): RobloxGlobal => {
  const roblox = Reflect.get(window, "Roblox");

  return isRobloxGlobal(roblox) ? roblox : {};
};

export const getCurrentUser = (): RobloxCurrentUser => {
  return getRobloxGlobal().CurrentUser ?? { userId: "0", isAuthenticated: false };
};

export const getEventStream = (): RobloxEventStream | null => {
  return getRobloxGlobal().EventStream ?? null;
};

export const getGameLauncher = (): RobloxGameLauncher | null => {
  return getRobloxGlobal().GameLauncher ?? null;
};

export const getGuac = (): RobloxGuac | null => {
  return getRobloxGlobal().Guac ?? null;
};

const isPresenceModule = (value: unknown): value is RobloxPresence => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const presence = value as RobloxPresence;

  return (
    typeof presence.getPresenceProvider === "function" ||
    typeof presence.getPresences === "function" ||
    typeof presence.subscribeToPresenceChanges === "function"
  );
};

export const getPresence = (): RobloxPresence | null => {
  const robloxPresence: unknown = Reflect.get(window, "RobloxPresence");

  if (isPresenceModule(robloxPresence)) {
    return robloxPresence;
  }

  const legacyPresence = getRobloxGlobal().Presence;

  if (isPresenceModule(legacyPresence)) {
    return legacyPresence;
  }

  return null;
};

export const getPresenceProvider = (): RobloxPresenceProvider | null => {
  const presence = getPresence();

  if (!presence) {
    return null;
  }

  if (typeof presence.getPresenceProvider === "function") {
    return presence.getPresenceProvider();
  }

  if (
    typeof presence.getPresences === "function" ||
    typeof presence.subscribeToPresenceChanges === "function"
  ) {
    return presence;
  }

  return null;
};

export const getRealTimeClient = (): RobloxRealTimeClient | null => {
  const factory = getRobloxGlobal().RealTime?.Factory;

  if (typeof factory?.GetClient !== "function") {
    return null;
  }

  return factory.GetClient() ?? null;
};

export const getDeviceMeta = (): RobloxDeviceMeta => {
  const { DeviceMeta } = getRobloxGlobal();

  return DeviceMeta ? new DeviceMeta() : {};
};
