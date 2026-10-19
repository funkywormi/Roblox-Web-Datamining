import { useHistory } from "react-router-dom";
import { Icon, List, ListItem } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import protectionShieldDark from "@rbx/foundation-images/pictograms/protection_shield_dark.svg";
import protectionShieldLight from "@rbx/foundation-images/pictograms/protection_shield_light.svg";
import type { Report } from "../../types/api";
import { getReportDetailPath } from "../../shared/utils/navigation";
import { HOW_TO_REPORT_URL } from "../../shared/url";
import { formatReportDate } from "./util/dateTime";

interface ReportListProps {
  reports: Report[];
}

const ReportList = ({ reports }: ReportListProps) => {
  const { translate } = useTranslation();
  const history = useHistory();

  return reports.length > 0 ? (
    <List>
      {reports.map((report, index) => {
        const isLastRow = index === reports.length - 1;
        const divider = isLastRow ? "None" : "Full"; // Fixes Foundation UI List double border bug

        return (
          <ListItem
            title={report.title}
            metadata={report.metadata}
            description={formatReportDate(report.description)}
            key={report.id}
            divider={divider}
            isContained={false}
            trailing={
              <Icon
                name="icon-regular-chevron-large-right"
                size="Medium"
                className="shrink-0 rtl:[transform:scaleX(-1)]"
              />
            }
            onSelect={() => {
              history.push(getReportDetailPath(report.id));
            }}
          />
        );
      })}
    </List>
  ) : (
    <div className="flex flex-col items-center justify-center gap-small">
      <img src={protectionShieldLight} alt="" className="dark:hidden" />
      <img src={protectionShieldDark} alt="" className="hidden dark:block" />
      <span className="text-heading-medium">{translate("Heading.NoReportsYet")}</span>
      <span className="text-body-medium">{translate("Description.NoReportsYet")}</span>
      <a
        className="content-link text-body-medium"
        href={HOW_TO_REPORT_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        {translate("Link.ViewReportingInstructions")}
      </a>
    </div>
  );
};

export default ReportList;
