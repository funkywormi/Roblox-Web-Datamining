import { useState, useEffect, useMemo } from "react";
import bedev2Services from "../services/bedev2Services";

type TAppPolicyData = {
  shouldShowLikeFavoriteCounts: boolean | undefined;
  experienceDetailsNoticeType: string | undefined;
  shouldShowVpcPlayButtonUpsells: boolean | undefined;
};

type TUseGetAppPolicyData = TAppPolicyData & {
  isFetchingPolicy: boolean;
};

const useGetAppPolicyData = (): TUseGetAppPolicyData => {
  const [appPolicyData, setAppPolicyData] = useState<TAppPolicyData>({
    shouldShowLikeFavoriteCounts: undefined,
    experienceDetailsNoticeType: undefined,
    shouldShowVpcPlayButtonUpsells: undefined,
  });

  const [isFetchingPolicy, setIsFetchingPolicy] = useState<boolean>(false);

  useEffect(() => {
    setIsFetchingPolicy(true);
    bedev2Services
      .getGuacAppPolicyBehaviorData()
      .then(data => {
        setAppPolicyData({
          shouldShowLikeFavoriteCounts: data.EnableAggregateLikesFavoritesCount,
          experienceDetailsNoticeType: data.experienceDetailsNoticeType,
          shouldShowVpcPlayButtonUpsells: data.shouldShowVpcPlayButtonUpsells,
        });
      })
      .catch(() => {
        setAppPolicyData({
          shouldShowLikeFavoriteCounts: false,
          experienceDetailsNoticeType: undefined,
          shouldShowVpcPlayButtonUpsells: false,
        });
      })
      .finally(() => {
        setIsFetchingPolicy(false);
      });
  }, []);

  return useMemo(() => {
    const {
      shouldShowLikeFavoriteCounts,
      experienceDetailsNoticeType,
      shouldShowVpcPlayButtonUpsells,
    } = appPolicyData;

    return {
      shouldShowLikeFavoriteCounts,
      experienceDetailsNoticeType,
      shouldShowVpcPlayButtonUpsells,
      isFetchingPolicy,
    };
  }, [
    appPolicyData.shouldShowLikeFavoriteCounts,
    appPolicyData.experienceDetailsNoticeType,
    appPolicyData.shouldShowVpcPlayButtonUpsells,
    isFetchingPolicy,
  ]);
};

export default useGetAppPolicyData;
