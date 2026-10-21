import { Timeline, TimelineItem } from "@rbx/foundation-ui";
import { Details, ActivityStatus } from "../../types/api";
import { formatReportDate } from "./util/dateTime";

const ReportTimeline = ({ details }: { details: Details }) => {
  const { activities } = details;

  return (
    <Timeline placement="Start">
      {/* Reversing the activities array to show the most recent activity first */}
      {activities.toReversed().map(activity => {
        return (
          <TimelineItem
            key={activity.id}
            title={activity.title}
            description={activity.description}
            // Only show a blank circle for the "currently reviewing your report" activity, checkmark for everything else
            icon={
              activity.status === ActivityStatus.Reviewing
                ? "icon-regular-circle"
                : "icon-filled-circle-check"
            }
          >
            <span className="text-body-small">
              {activity.date && formatReportDate(activity.date)}
            </span>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
};

export default ReportTimeline;
