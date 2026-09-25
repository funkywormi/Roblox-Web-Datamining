import { Fragment } from "react";
import { useNotApprovedTranslate } from "../../providers/NotApprovedUIProvider";
import { NAPageItemConfigType } from "../ConfigTypes";
import EvidenceField from "../../components/EvidenceField";
import { useNotApprovedPagePunishment } from "../../context/NotApprovedPagePunishmentProvider";

/**
 * Displays the reason for the violation (e.g. Profanity, Spam, etc.) along with the moderator note.
 * The purpose of the section is to emphasize to the user what happened to them in an effort to make
 * it more clear exactly why we punished them.
 */
const WhatHappenedPageItem = (): JSX.Element => {
  const translate = useNotApprovedTranslate();
  const { violationReasons, isKidsTreatment, moderatorNote } = useNotApprovedPagePunishment();

  const violationReasonsContent =
    (violationReasons?.translatedReasons ?? []).join(", ") || translate("Label.AbuseType.Other");

  return (
    <div className="flex flex-col gap-medium" data-testid="what-happened">
      <span className="text-title-large">
        {translate(isKidsTreatment ? "Heading.Why" : "Label.WhatHappened")}
      </span>

      <div className="padding-large bg-shift-100 radius-medium flex flex-col gap-small">
        {isKidsTreatment ? (
          <EvidenceField
            fieldLabel={violationReasonsContent}
            fieldValue={moderatorNote}
            showColon={false}
            preline
          />
        ) : (
          <Fragment>
            <EvidenceField
              fieldLabel={translate("Label.Reason")}
              fieldValue={violationReasonsContent}
            />
            <EvidenceField
              fieldLabel={translate("Label.ModeratorNote")}
              fieldValue={moderatorNote}
              preline
            />
          </Fragment>
        )}
      </div>
    </div>
  );
};

const WhatHappenedPageItemConfig: NAPageItemConfigType = {
  getIsVisible: () => true,
  renderComponent: WhatHappenedPageItem,
  configName: "what-happened",
};

export default WhatHappenedPageItemConfig;
