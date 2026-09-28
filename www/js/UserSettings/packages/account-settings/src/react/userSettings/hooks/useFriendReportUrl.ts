import { useMemo } from "react";
import { CurrentUser } from "Roblox";
import { useGetAbuseReportRevampPolicyQuery } from "../../apis/universalAppConfigurationApi";
import { getAbuseReportRevampUrl, getReportUrl } from "../constants/urlConstants";

// The report is filed by whoever is signed in, which is the parent on a remote dashboard and the
// child on their own device.
const useFriendReportUrl = (friendId: number): string => {
  const { data: abuseReportRevampPolicy } = useGetAbuseReportRevampPolicyQuery();

  return useMemo(() => {
    if (abuseReportRevampPolicy?.EnableParentalDashboard) {
      return getAbuseReportRevampUrl({
        targetId: String(friendId),
        submitterId: CurrentUser.userId,
        abuseVector: "userprofile",
      });
    }
    return getReportUrl(friendId);
  }, [abuseReportRevampPolicy, friendId]);
};

export default useFriendReportUrl;
