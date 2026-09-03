import { useHistory } from "react-router-dom";
import { Icon, List, ListItem } from "@rbx/foundation-ui";
import type { Report } from "../../types/api";
import { getReportDetailPath } from "../../shared/utils/navigation";

interface ReportListProps {
  reports: Report[];
}

const ReportList = ({ reports }: ReportListProps) => {
  const history = useHistory();

  const emptyStateTitle = "No reports"; // TODO: @andrewxu localize
  const emptyStateDescription = "Any reports you send will appear here."; // TODO: @andrewxu localize

  return reports.length > 0 ? (
    <List>
      {reports.map((report, index) => {
        const isLastRow = index === reports.length - 1;
        const divider = isLastRow ? "None" : "Full"; // Fixes Foundation UI List double border bug

        return (
          <ListItem
            title={report.title}
            metadata={report.metadata}
            description={report.description}
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
      <Icon name="icon-regular-page" size="Large" />
      <span className="text-title-medium">{emptyStateTitle}</span>
      <span className="text-body-medium">{emptyStateDescription}</span>
    </div>
  );
};

export default ReportList;
