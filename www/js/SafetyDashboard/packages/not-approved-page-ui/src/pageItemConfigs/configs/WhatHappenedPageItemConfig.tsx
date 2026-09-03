import { useNotApprovedTranslate } from "../../providers/NotApprovedUIProvider";
import { NAPageItemConfigType, PageItemRenderingProps } from "../ConfigTypes";
import EvidenceField from "../../components/EvidenceField";
import { useNotApprovedPagePunishment } from "../../context/NotApprovedPagePunishmentProvider";

/**
 * Displays the reason for the violation (e.g. Profanity, Spam, etc.) along with the moderator note.
 * The purpose of the section is to emphasize to the user what happened to them in an effort to make
 * it more clear exactly why we punished them.
 */
const WhatHappenedPageItem = (props: PageItemRenderingProps): JSX.Element => {
  const translate = useNotApprovedTranslate();
  const { violationReasons } = useNotApprovedPagePunishment();

  const { punishmentData } = props;
  const { messageToUser } = punishmentData;

  return (
    <div className="flex flex-col gap-medium" data-testid="what-happened">
      <span className="text-title-large">{translate("Label.WhatHappened")}</span>

      <div className="padding-large bg-shift-100 radius-medium flex flex-col gap-small">
        <EvidenceField
          fieldLabel={translate("Label.Reason")}
          fieldValue={
            (violationReasons?.translatedReasons ?? []).join(", ") ||
            translate("Label.AbuseType.Other")
          }
        />
        <EvidenceField
          fieldLabel={translate("Label.ModeratorNote")}
          fieldValue={
            messageToUser || translate("Description.Violation", { startLink: "", endLink: "" })
          }
          preline
        />
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
