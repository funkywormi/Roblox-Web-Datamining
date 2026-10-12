import environmentUrls from "@rbx/environment-urls";
import { parseInt } from "@rbx/core-lib/number";
import type { HbaMeta } from "./internal/types";

const baseHbaMeta = {
  isSecureAuthenticationIntentEnabled: true,
  isBoundAuthTokenEnabled: true,
  // Only drives the jQuery BAT rollout, which reads the .NET meta tag directly.
  boundAuthTokenWhitelist: "",
  boundAuthTokenExemptlist: '{"Exemptlist":[]}',
  hbaIndexedDBVersion: 1,
  batEventSampleRate: 500,
};

const productionHbaMeta: HbaMeta = {
  ...baseHbaMeta,
  hbaIndexedDBName: "hbaDB",
  hbaIndexedDBObjStoreName: "hbaObjectStore",
  hbaIndexedDBKeyName: "hba_keys",
};

const sitetestHbaMeta: HbaMeta = {
  ...baseHbaMeta,
  hbaIndexedDBName: "hbaDb-Test",
  hbaIndexedDBObjStoreName: "hbaObjStore-Test",
  hbaIndexedDBKeyName: "hba-keys",
};

const readHbaMetaTag = (): HbaMeta | null => {
  if (typeof document === "undefined") {
    return null;
  }
  const metaTag = document.querySelector<HTMLElement>(
    'meta[name="hardware-backed-authentication-data"]',
  );
  if (metaTag == null) {
    return null;
  }
  const keyMap = metaTag.dataset;
  return {
    isBoundAuthTokenEnabled: keyMap.isBoundAuthTokenEnabled === "true",
    boundAuthTokenWhitelist: keyMap.boundAuthTokenWhitelist ?? "",
    boundAuthTokenExemptlist: keyMap.boundAuthTokenExemptlist ?? "",
    hbaIndexedDBName: keyMap.hbaIndexedDbName ?? "",
    hbaIndexedDBObjStoreName: keyMap.hbaIndexedDbObjStoreName ?? "",
    hbaIndexedDBKeyName: keyMap.hbaIndexedDbKeyName ?? "",
    hbaIndexedDBVersion: parseInt(keyMap.hbaIndexedDbVersion ?? "") ?? 1,
    batEventSampleRate: parseInt(keyMap.batEventSampleRate ?? "") ?? 0,
    isSecureAuthenticationIntentEnabled: keyMap.isSecureAuthenticationIntentEnabled === "true",
  };
};

export const hbaMeta = (): HbaMeta =>
  readHbaMetaTag() ??
  (environmentUrls.domain === "roblox.com" ? productionHbaMeta : sitetestHbaMeta);
