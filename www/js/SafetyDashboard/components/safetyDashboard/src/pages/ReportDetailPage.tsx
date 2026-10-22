import { ReactElement } from "react";
import { useParams } from "react-router-dom";
import { useReports } from "../api/useReports";
import { useBackNavigation } from "../hooks/useBackNavigation";
import PageHeader from "../shared/components/PageHeader";
import Timeline from "../features/reportInbox/ReportTimeline";
import { HELP_SAFETY_URL } from "../shared/url";
import ReportEducation from "../features/reportInbox/ReportEducation";
import { useTranslation } from "@rbx/core-scripts/react";
import { getLatestActivityStatus } from "../features/reportInbox/util/reports";
import { useEffectUntilTrueOnce } from "../hooks/useEffectUntilTrueOnce";
import { SafetyDashboardEventType } from "../telemetry/eventTypes";
import { sendSafetyDashboardEvent } from "../telemetry/sendSafetyDashboardEvent";

const ReportDetailPage = (): ReactElement => {
  // Report inbox should always fall back to the Help & Safety page. Although the report inbox page is in the safety dashboard
  // component, there isn't an entry point from safety dashboard into report inbox, only one from Help & Safety.
  const onBack = useBackNavigation(() => {
    window.location.href = HELP_SAFETY_URL;
  });
  const { id } = useParams<{ id: string }>();
  const { reports } = useReports();
  const { translate } = useTranslation();
  const report = reports.find(r => r.id === id);
  const details = report?.details;

  useEffectUntilTrueOnce(() => {
    if (!report || !details) {
      return false;
    }

    sendSafetyDashboardEvent(SafetyDashboardEventType.ReportDetailView, {
      latestStatus: getLatestActivityStatus(report),
      activityCount: details.activities.length,
    });
    return true;
  });

  if (!report || !details) {
    return (
      <div className="flex flex-col gap-xxlarge padding-x-large max-width-[850px] width-full margin-x-auto">
        <PageHeader title={translate("Label.SomethingWentWrong")} onBack={onBack} />
        <p>{translate("Label.LoadingReportsError")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-xxlarge padding-x-large max-width-[850px] width-full margin-x-auto">
      <PageHeader title={report.reportPageHeader} onBack={onBack} />
      <div className="flex flex-col">
        <span className="text-title-large">{details.title}</span>
        <span className="text-body-medium">{details.description}</span>
      </div>
      <Timeline details={details} />
      {details.educationSection && <ReportEducation section={details.educationSection} />}
    </div>
  );
};

export default ReportDetailPage;
