import catalogConstants from '../constants/catalogConstants';

const isUserInMarketplaceWidgetsLandingPageRollout = (
  userId: string | number | undefined | null
): boolean => {
  const parsedUserId = typeof userId === 'number' ? userId : parseInt(String(userId ?? ''), 10);
  if (!Number.isFinite(parsedUserId) || parsedUserId <= 0) {
    return false;
  }

  return parsedUserId % 100 === catalogConstants.marketplaceWidgetsLandingPageRollout.lastTwoDigits;
};

export default isUserInMarketplaceWidgetsLandingPageRollout;
