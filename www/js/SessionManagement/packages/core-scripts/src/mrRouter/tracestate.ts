export const MR_ROUTER_TRACESTATE_KEY = "mrrouter-env";
export const TRACESTATE_HEADER = "tracestate";

/**
 * Sets or replaces only the MrRouter `tracestate` list member, leaving all other
 * comma-separated key=value pairs unchanged and in order.
 */
export const mergeMrRouterTracestate = (existing: string | undefined, envName: string): string => {
  const newEntry = `${MR_ROUTER_TRACESTATE_KEY}=${encodeURIComponent(envName)}`;
  const existingTrimmed = existing?.trim();
  const existingAsArray = existingTrimmed ? existingTrimmed.split(",") : [];

  const getKey = (part: string): string => {
    const eq = part.indexOf("=");
    return (eq === -1 ? part : part.slice(0, eq)).trim();
  };

  const keyIdx = existingAsArray.findIndex(p => getKey(p) === MR_ROUTER_TRACESTATE_KEY);
  if (keyIdx === -1) {
    return [...existingAsArray.map(s => s.trim()), newEntry].join(",");
  }

  // Filter out all duplicate mrrouter-env entries, trim whitespace, insert at first match position
  const filtered = existingAsArray
    .filter(p => getKey(p) !== MR_ROUTER_TRACESTATE_KEY)
    .map(s => s.trim());
  filtered.splice(keyIdx, 0, newEntry);
  return filtered.join(",");
};
