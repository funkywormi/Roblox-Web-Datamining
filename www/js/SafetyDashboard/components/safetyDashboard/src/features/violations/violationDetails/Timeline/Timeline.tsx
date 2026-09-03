import React from "react";
import { Icon } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { Appeal, EnrichedViolation, Violation } from "../../util/violations";
import AppealApprovedItem from "./AppealApprovedItem";
import AppealWindowClosedItem from "./AppealWindowClosedItem";
import AppealRequestedItem from "./AppealRequestedItem";
import AppealRejectedItem from "./AppealRejectedItem";
import AppealEducationalPassItem from "./AppealEducationalPassItem";
import ViolationResolvedItem from "./ViolationResolvedItem";

/**
 * Flattens the appeals history for a given violation into a list of items. The function
 * handles determining what timeline items to show based on the violation's state and appeals history.
 */
const flattenAppealsHistory = (violation: EnrichedViolation) => {
  const { appeals } = violation;
  const flat: {
    content: React.ReactNode;
    id: string;
  }[] = [];

  // We show the most recent appeals first (i.e. reverse-chronological order)
  appeals.forEach((appeal, index) => {
    if (appeal.state === Appeal.state.APPEAL_STATE_DENIED) {
      const isFinalAppeal = violation.remaining_appeal_attempts === 0 && index === 0;
      flat.push({
        content: (
          <AppealRejectedItem appeal={appeal} isFinal={isFinalAppeal} violation={violation} />
        ),
        id: `${appeal.uid}-denied`,
      });
    } else if (appeal.state === Appeal.state.APPEAL_STATE_ACCEPTED) {
      flat.push({
        content: <AppealApprovedItem appeal={appeal} />,
        id: `${appeal.uid}-approved`,
      });
    } else if (appeal.state === Appeal.state.APPEAL_STATE_EDUCATIONAL_PASS) {
      flat.push({
        content: <AppealEducationalPassItem appeal={appeal} />,
        id: `${appeal.uid}-educational-pass`,
      });
    }

    /**
     * We don't show the appeal request item for an educational pass since the user didn't actually
     * "submit" an appeal. It's more of a nuance as to how the backend processes educational passes
     * so we are ok with just showing the educational pass item without a corresponding request item.
     */
    if (appeal.state !== Appeal.state.APPEAL_STATE_EDUCATIONAL_PASS) {
      flat.push({
        content: <AppealRequestedItem appeal={appeal} />,
        id: `${appeal.uid}-initial`,
      });
    }
  });

  /**
   * If the appeal window is closed and the violation was not approved or bypassed with an educational pass,
   * we want to always show that the appeal window is closed first.
   */
  if (
    violation.expired &&
    ![
      Violation.state.VIOLATION_STATE_APPEAL_ACCEPTED,
      Violation.state.VIOLATION_STATE_EDUCATIONAL_PASS,
      Violation.state.VIOLATION_STATE_INACTIVE,
    ].includes(violation.state)
  ) {
    flat.unshift({
      content: <AppealWindowClosedItem violation={violation} />,
      id: "appeal-window-closed",
    });
  }

  /**
   * If the violation has entered the INACTIVE (resolved) state, prepend a resolved
   * item to the top of the timeline. Prior appeal activity still renders below.
   */
  if (violation.state === Violation.state.VIOLATION_STATE_INACTIVE) {
    flat.unshift({
      content: <ViolationResolvedItem violation={violation} />,
      id: "violation-resolved",
    });
  }

  return flat;
};

/**
 * For a given violation, a user can submit appeals to have their violation reviewed again.
 * This component displays a timeline with the history of events that occurred during the appeal process.
 * The events are displayed in reverse chronological order so that users can quickly see the most recent
 * updates to their appeals.
 */
const Timeline = ({ violation }: { violation: EnrichedViolation }) => {
  const { translate } = useTranslation();
  const history = flattenAppealsHistory(violation);

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-medium">
      <span className="text-title-large">{translate("Heading.AppealTimeline")}</span>

      <div className="flex flex-col radius-medium bg-shift-100 padding-xxlarge">
        {history.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === history.length - 1;

          return (
            <div key={item.id} className="flex gap-large">
              <div className="flex flex-col gap-xxsmall items-center">
                <div className={`${isFirst ? "" : "bg-shift-300"} width-50 height-200`} />
                <Icon name="icon-regular-diamond-simplified" />
                {!isLast && <div className="bg-shift-300 width-50 grow-1" />}
              </div>

              <div className={isLast ? "" : "margin-bottom-medium"}>{item.content}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
