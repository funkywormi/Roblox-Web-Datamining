import { useNotApprovedTranslate } from "../../providers/NotApprovedUIProvider";
import { TPunishment } from "../../utils/types";
import { NAPageItemConfigType, PageItemRenderingProps } from "../ConfigTypes";
import isPlatformEvidenceVisibleInView from "../../utils/isPlatformEvidenceVisibleInView";
import { useFormatFullDate } from "../../utils/getFormattedFullDate";
import EvidenceField from "../../components/EvidenceField";
import ViewActivityButton from "../../components/ViewActivityButton";

/**
 * Only displayed if there is no platform evidence visible in view and there are no bad utterances.
 * Acts as a basic "evidence" section without much additional information.
 */
const SimpleEvidencePageItem = (props: PageItemRenderingProps): JSX.Element => {
  const translate = useNotApprovedTranslate();
  const formatFullDate = useFormatFullDate();
  const { punishmentData } = props;
  const { beginDate, consequenceTransparencyMessage } = punishmentData;

  return (
    <div className="flex flex-col gap-small" data-testid="simple-evidence">
      <EvidenceField
        fieldLabel={translate("Label.ReviewDate")}
        fieldValue={formatFullDate(beginDate)}
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

const SimpleEvidencePageItemConfig: NAPageItemConfigType = {
  getIsVisible: (punishmentData: TPunishment) => {
    return (
      !isPlatformEvidenceVisibleInView(punishmentData) &&
      (punishmentData.badUtterances?.length ?? 0) === 0
    );
  },
  renderComponent: SimpleEvidencePageItem,
  configName: "simple-evidence",
};

export default SimpleEvidencePageItemConfig;
