import { useState } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { InterventionType } from "../types/api";
import useAccountStanding from "../api/useAccountStanding";
import { isHTTPError } from "../features/violations/util/violations";
import { useEffectUntilTrueOnce } from "../hooks/useEffectUntilTrueOnce";
import { SafetyDashboardEventType } from "../telemetry/eventTypes";
import { sendSafetyDashboardEvent } from "../telemetry/sendSafetyDashboardEvent";
import { activeRestrictedFeatures } from "../shared/utils/intervention";
import StatusHero from "../features/accountStatus/StatusHero";
import TimeoutsSection from "../features/timeouts/TimeoutsSection";
import RecentViolationsSection from "../features/violations/recentViolations/RecentViolationsSection";
import CommunityTipsSection from "../features/communityTips/CommunityTipsSection";
import StatusExplainerSheet from "../features/accountStatus/StatusExplainerSheet";
import AccountRestrictionDialog from "../features/accountStatus/AccountRestrictionDialog";
import PageHeader from "../shared/components/PageHeader";

/**
 * The main page for the Safety Dashboard. Renders the user's status, timeouts, violations, and community
 * tips.
 */
const AccountStatusPage = () => {
  const { translate } = useTranslation();
  const { data: standing, isError, error } = useAccountStanding();

  const [accountRestrictionDialogOpen, setAccountRestrictionDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const isDeleted = standing?.worstPlatformIntervention?.type === InterventionType.Delete;
  const status = standing?.statusInfo.status;
  const worstIntervention = standing?.worstPlatformIntervention?.type;

  useEffectUntilTrueOnce(() => {
    if (!standing) {
      return false;
    }

    sendSafetyDashboardEvent(
      SafetyDashboardEventType.PageView,
      { featureRestrictionCount: activeRestrictedFeatures(standing.features).length },
      status,
      worstIntervention,
    );
    return true;
  });

  useEffectUntilTrueOnce(() => {
    if (!isError) {
      return false;
    }

    sendSafetyDashboardEvent(SafetyDashboardEventType.AccountStandingError, {
      statusCode: isHTTPError(error) ? error.status : 0,
      message: error instanceof Error ? error.message : String(error),
    });
    return true;
  });

  /**
   * When the user is banned, there's no use for the status explainer sheet since they can't do better or worse (they don't have
   * access to anything anymore permanently) so we just let the user view the NAP content directly.
   */
  const handleStatusLinkPress = () => {
    if (isDeleted) {
      sendSafetyDashboardEvent(
        SafetyDashboardEventType.AccountRestrictionOpen,
        { trigger: "statusLink" },
        status,
        worstIntervention,
      );
      setAccountRestrictionDialogOpen(true);
    } else {
      sendSafetyDashboardEvent(
        SafetyDashboardEventType.StatusExplainerOpen,
        {},
        status,
        worstIntervention,
      );
      setStatusDialogOpen(true);
    }
  };

  const handleAccountRestrictionOpen = () => {
    sendSafetyDashboardEvent(
      SafetyDashboardEventType.AccountRestrictionOpen,
      { trigger: "timeoutRow" },
      status,
      worstIntervention,
    );
    setAccountRestrictionDialogOpen(true);
  };

  return (
    <div
      data-testid="account-status-page"
      className="flex flex-col gap-xxlarge padding-large max-width-[850px] width-full margin-x-auto"
    >
      <PageHeader title={translate("Heading.AccountStatus")} />

      <StatusHero onStatusLinkPress={handleStatusLinkPress} />
      {!isDeleted && <TimeoutsSection onAccountRestrictionOpen={handleAccountRestrictionOpen} />}
      <RecentViolationsSection />
      {!isDeleted && <CommunityTipsSection />}

      <StatusExplainerSheet
        open={statusDialogOpen}
        onClose={() => {
          setStatusDialogOpen(false);
        }}
      />
      <AccountRestrictionDialog
        open={accountRestrictionDialogOpen}
        onClose={() => {
          setAccountRestrictionDialogOpen(false);
        }}
      />
    </div>
  );
};

export default AccountStatusPage;
