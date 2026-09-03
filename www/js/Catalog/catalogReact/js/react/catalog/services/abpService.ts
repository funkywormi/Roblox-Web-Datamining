import { AdsHelper } from 'Roblox';
import { useCallback } from 'react';

const adIds = {
  leaderboardAbp: 'Leaderboard-Abp',
  skyscraperAdpRight: 'Skyscraper-Abp-Right'
};

function useAdsService() {
  const registerAd = useCallback(adId => {
    if (AdsHelper && AdsHelper.AdRefresher) {
      AdsHelper.AdRefresher.registerAd(adId);
    }
  }, []);

  const refreshAllAds = useCallback(() => {
    if (AdsHelper && AdsHelper.AdRefresher) {
      AdsHelper.AdRefresher.refreshAds();
    }
  }, []);

  return { registerAd, refreshAllAds, adIds };
}

export default useAdsService;
