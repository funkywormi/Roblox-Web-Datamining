import { Timeline, TimelineItem } from "@rbx/foundation-ui";
import { Details } from "../../types/api";

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
            description={activity.metadata}
            icon="icon-regular-middle-dot"
          >
            <span className="text-body-small">{activity.description}</span>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
};

export default ReportTimeline;
