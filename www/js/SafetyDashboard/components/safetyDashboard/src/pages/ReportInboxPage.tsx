import { ReactElement } from "react";
import { useReports } from "../api/useReports";
import PageHeader from "../shared/components/PageHeader";
import ReportList from "../features/reportInbox/ReportList";

const ReportInboxPage = (): ReactElement => {
  const { inboxPageHeader, reports } = useReports();

  return (
    <div className="flex flex-col gap-xxlarge padding-x-large max-width-[850px] width-full margin-x-auto">
      <PageHeader title={inboxPageHeader} />

      <div className="flex flex-col gap-large">
        <ReportList reports={reports} />
      </div>
    </div>
  );
};

export default ReportInboxPage;
