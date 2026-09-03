import { useState } from "react";
import { Button, Divider } from "@rbx/foundation-ui";
import { useNotApprovedTranslate } from "../../providers/NotApprovedUIProvider";
import { TBadUtterance, TPunishment } from "../../utils/types";
import { NAPageItemConfigType, PageItemRenderingProps } from "../ConfigTypes";
import { useFormatFullDate } from "../../utils/getFormattedFullDate";
import isPlatformEvidenceVisibleInView from "../../utils/isPlatformEvidenceVisibleInView";
import EvidenceField from "../../components/EvidenceField";
import ViewActivityButton from "../../components/ViewActivityButton";

const DEFAULT_NUM_UTTERANCES = 4;
const COLON = ":";

/**
 * The actual content that holds the bad utterances data. It is separated from
 * the page item config for the sake of readability.
 */
const BadUtterancesContent = ({ badUtterances }: { badUtterances: TBadUtterance[] }) => {
  const [showAll, setShowAll] = useState(false);
  const translate = useNotApprovedTranslate();

  return (
    <div className="flex flex-col gap-small">
      <div className="flex flex-col">
        <span className="text-title-medium">
          {translate("Label.OffensiveItem.V2")}
          {COLON}
        </span>

        <div className="flex flex-col items-start">
          {badUtterances.slice(0, DEFAULT_NUM_UTTERANCES).map(element => (
            <p
              key={element.utteranceText}
              className="text-body-medium"
              style={{ wordBreak: "break-word" }}
            >
              {element.utteranceText}
            </p>
          ))}

          {badUtterances.slice(DEFAULT_NUM_UTTERANCES).map(element => (
            <p
              key={element.utteranceText}
              className={`text-body-medium ${showAll ? "" : "hidden"}`}
              style={{ wordBreak: "break-word" }}
            >
              {element.utteranceText}
            </p>
          ))}
        </div>
      </div>

      {badUtterances.length > DEFAULT_NUM_UTTERANCES && (
        <Button
          className="self-start margin-left-[-7px]"
          variant="Link"
          size="XSmall"
          onClick={() => {
            setShowAll(prev => !prev);
          }}
          data-testid="view-toggle-button"
        >
          {showAll ? translate("Action.ViewLess") : translate("Action.ViewMore")}
        </Button>
      )}
    </div>
  );
};

/**
 * A page item config that showcases the bad utterances data for a punishment.
 * The component essentially enumerates each violating item identified under a corresponding category.
 * For now, this component should only be rendered if there is no platform evidence visible in view.
 */
const BadUtterancesPageItem = ({ punishmentData }: PageItemRenderingProps): JSX.Element => {
  const translate = useNotApprovedTranslate();
  const formatFullDate = useFormatFullDate();
  const { badUtterances, consequenceTransparencyMessage } = punishmentData;

  return (
    <div className="flex flex-col gap-small" data-testid="bad-utterances">
      <BadUtterancesContent badUtterances={badUtterances ?? []} />
      <Divider />
      <EvidenceField
        fieldLabel={translate("Label.ReviewDate")}
        fieldValue={formatFullDate(punishmentData.beginDate)}
      />
      {consequenceTransparencyMessage && (
        <EvidenceField
          fieldLabel={translate("Label.DecisionMethod")}
          fieldValue={consequenceTransparencyMessage}
        />
      )}
      <ViewActivityButton />
    </div>
  );
};

const BadUtterancesPageItemConfig: NAPageItemConfigType = {
  getIsVisible: (punishmentData: TPunishment) => {
    return (
      !isPlatformEvidenceVisibleInView(punishmentData) &&
      (punishmentData.badUtterances?.length ?? 0) > 0
    );
  },
  renderComponent: BadUtterancesPageItem,
  configName: "bad-utterances",
};

export default BadUtterancesPageItemConfig;
