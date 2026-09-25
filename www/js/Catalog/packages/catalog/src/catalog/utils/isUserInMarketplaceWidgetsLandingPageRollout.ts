import catalogConstants from "../constants/catalogConstants";

const isUserInMarketplaceWidgetsLandingPageRollout = (
  userId: string | number | undefined | null,
): boolean => {
  const parsedUserId = typeof userId === "number" ? userId : parseInt(String(userId ?? ""), 10);
  if (!Number.isFinite(parsedUserId) || parsedUserId <= 0) {
    return false;
  }

  const { modulus, lastTwoDigits } = catalogConstants.marketplaceWidgetsLandingPageRollout;
  return parsedUserId % modulus === lastTwoDigits;
};

export default isUserInMarketplaceWidgetsLandingPageRollout;
