import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNotApprovedUIConfig } from "../providers/NotApprovedUIProvider";
import { AgeExperience } from "../providers/types";

export const IXP_LAYER_NAME = "UserSafety.NotApprovedPage.UserID";
const KIDS_NOT_APPROVED_PAGE_PARAMETER = "FFlagKidsNotApprovedPageTreatment2";

export interface IxpConfig {
  FFlagKidsNotApprovedPageTreatment2?: boolean;
}

interface UseNotApprovedPageIxpProps {
  enabled: boolean;
}

/**
 * The hook that fetches IXP data for the current user. Since we don't expect the IXP data to change
 * frequently, we can cache it indefinitely. The API returns the parameters for every experiment in the
 * layer, so we can use this hook to fetch all the IXP data for the current user.
 */
const useNotApprovedPageIxp = ({ enabled }: UseNotApprovedPageIxpProps) => {
  const { ageExperience = AgeExperience.Default, ixp } = useNotApprovedUIConfig();

  const query = useQuery({
    queryKey: [`ixp/${IXP_LAYER_NAME}`],
    queryFn: async () => {
      if (!ixp) return {};
      try {
        return await ixp.fetchLayer(IXP_LAYER_NAME);
      } catch {
        return {};
      }
    },
    // IXP data shouldn't change frequently so we can cache it indefinitely
    staleTime: Infinity,
    enabled: enabled && Boolean(ixp),
  });

  const isKidsExperimentEnrolled = query.data && KIDS_NOT_APPROVED_PAGE_PARAMETER in query.data;

  useEffect(() => {
    if (ageExperience !== AgeExperience.Kids || !isKidsExperimentEnrolled) {
      return;
    }

    ixp?.logExposure(IXP_LAYER_NAME);
  }, [ageExperience, isKidsExperimentEnrolled, ixp]);

  return query;
};

export default useNotApprovedPageIxp;
