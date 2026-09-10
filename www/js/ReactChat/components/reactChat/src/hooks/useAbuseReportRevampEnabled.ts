import { useQuery } from "@tanstack/react-query";
import { callBehaviour } from "@rbx/core-scripts/guac";

// The abuse-report revamp is gated by the "abuse-reporting-revamp" GUAC behaviour, whose payload
// exposes an `EnableChat` boolean (parity with the legacy Angular chat, which reads the same
// behaviour + property in guacService.getAbuseReportRevampPolicies). When enabled, chat reports
// route to the new /report-abuse/ flow; otherwise they fall back to the legacy
// /abusereport/chat + AbuseReportDispatcher path.
const ABUSE_REPORT_REVAMP_GUAC_BEHAVIOUR = "abuse-reporting-revamp";

type TAbuseReportRevampPolicy = {
  EnableChat?: boolean;
};

const isAbuseReportRevampPolicy = (value: unknown): value is TAbuseReportRevampPolicy =>
  typeof value === "object" && value !== null;

/**
 * Reads the "abuse-reporting-revamp" GUAC behaviour once and resolves whether the chat abuse-report
 * revamp is enabled for this user (`EnableChat === true`). Defaults to false while loading or when
 * the behaviour/property is absent.
 */
export const useAbuseReportRevampEnabled = (): boolean => {
  const { data } = useQuery({
    queryKey: [`guac/${ABUSE_REPORT_REVAMP_GUAC_BEHAVIOUR}`],
    queryFn: () => callBehaviour<unknown>(ABUSE_REPORT_REVAMP_GUAC_BEHAVIOUR),
    staleTime: Infinity,
  });

  return isAbuseReportRevampPolicy(data) && data.EnableChat === true;
};

export default useAbuseReportRevampEnabled;
