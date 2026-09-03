/**
 * Parse a universeId out of a Servers Section URL
 * Valid Formats: /games/servers-section/{universeId} or /games/servers-section-preopen-create-vip/{universeId}
 *
 * Returns the number universeId if found, or undefined otherwise
 */
export const parseUniverseIdFromServersSectionUrl = (urlPathname: string): number | undefined => {
  const serversSectionRegex = /\/games\/servers-section\/(\d+)/;
  const serversSectionMatch = serversSectionRegex.exec(urlPathname);

  if (serversSectionMatch) {
    return parseInt(serversSectionMatch[1]!, 10);
  }

  const preopenCreateVipRegex = /\/games\/servers-section-preopen-create-vip\/(\d+)/;
  const preopenCreateVipMatch = preopenCreateVipRegex.exec(urlPathname);

  if (preopenCreateVipMatch) {
    return parseInt(preopenCreateVipMatch[1]!, 10);
  }

  return undefined;
};

/**
 * Returns whether the page should preopen the create VIP modal based on the URL
 */
export const getShouldPreopenCreateVip = (urlPathname: string): boolean => {
  return urlPathname.includes("servers-section-preopen-create-vip");
};
