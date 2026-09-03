import { useTranslation } from "@rbx/core-scripts/react";
import { Appeal } from "../../util/violations";
import Timestamp from "../Timestamp";

/**
 * When a user takes a second chance (educational) pass, they give up their chance to appeal the violation
 * since they admitted to the violation and were willing to learn about the rules.
 *
 * We use this item to show the user why they're unable to appeal the violation in the timeline.
 */
const AppealEducationalPassItem = ({ appeal }: { appeal: Appeal }) => {
  const { translate } = useTranslation();

  return (
    <div className="flex flex-col gap-xxsmall">
      <span className="text-title-medium">{translate("Heading.AppealUnavailable")}</span>
      <Timestamp timestamp={appeal.decision_time} />

      <p className="text-body-medium padding-top-small">{translate("Description.IssueClosed")}</p>
    </div>
  );
};
export default AppealEducationalPassItem;
