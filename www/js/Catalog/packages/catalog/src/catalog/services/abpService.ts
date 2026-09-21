import { useCallback } from "react";
import { AdsHelper } from "@rbx/legacy-webapp-types/Roblox";

const adIds = {
  leaderboardAbp: "Leaderboard-Abp",
  skyscraperAdpRight: "Skyscraper-Abp-Right",
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
