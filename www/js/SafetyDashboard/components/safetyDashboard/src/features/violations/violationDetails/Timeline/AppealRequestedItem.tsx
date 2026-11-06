import { useTranslation } from "@rbx/core-scripts/react";
import { Appeal } from "../../util/violations";
import Timestamp from "../Timestamp";

/**
 * Shown on the appeal timeline whenever a user submits an appeal for a violation.
 * This also includes showing the message a user submitted with their appeal if applicable.
 */
const AppealRequestedItem = ({
  appeal,
  isFromSomeoneElse,
}: {
  appeal: Appeal;
  isFromSomeoneElse: boolean;
}) => {
  const { translate } = useTranslation();

  return (
    <div className="flex flex-col gap-xxsmall">
      <span className="text-title-medium">
        {translate(isFromSomeoneElse ? "Label.AppealRequested" : "Header.AppealReceived")}
      </span>
      <Timestamp timestamp={appeal.create_time} />
      {isFromSomeoneElse && appeal.submitter_username && (
        <p className="text-body-medium content-default" style={{ wordBreak: "break-word" }}>
          {translate("Label.AppealSentBy", { username: appeal.submitter_username })}
        </p>
      )}

      <div className="flex flex-col gap-small padding-top-medium">
        <p className="text-body-medium">
          {translate(
            isFromSomeoneElse ? "Description.AppealReceivedNeutral" : "Description.AppealReceived",
          )}
        </p>

        {appeal.message && !isFromSomeoneElse && (
          <div className="flex flex-col gap-small">
            <p className="text-title-small text-emphasis">{translate("Label.AppealComment")}</p>
            <p
              className="text-body-small radius-medium bg-shift-100 stroke-default stroke-standard padding-medium"
              style={{ whiteSpace: "pre-line", wordBreak: "break-word" }}
            >
              {appeal.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppealRequestedItem;
