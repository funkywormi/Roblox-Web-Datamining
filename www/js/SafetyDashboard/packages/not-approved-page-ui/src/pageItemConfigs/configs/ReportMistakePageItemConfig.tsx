import { Button } from "@rbx/foundation-ui";
import { useNotApprovedTranslate } from "../../providers/NotApprovedUIProvider";
import { NAPageItemConfigType, PageItemRenderingProps, StaticPageName } from "../ConfigTypes";
import useAppealsRedirect from "../../hooks/useAppealsRedirect";
import { useNotApprovedPagePunishment } from "../../context/NotApprovedPagePunishmentProvider";
import { AppealsProcessPageItem } from "./AppealsProcessPageItemConfig";

/**
 * A short description that lets the user know that they can appeal their moderation decision.
 */
const ReportMistakePageItem = ({ punishmentData }: PageItemRenderingProps): JSX.Element => {
  const translate = useNotApprovedTranslate();
  const { handleAppealsClick } = useAppealsRedirect({ preferViolationDetail: true });
  const { isKidsTreatment } = useNotApprovedPagePunishment();

  return (
    <div className="flex flex-col gap-medium" data-testid="report-mistake">
      <p className="text-body-large">
        {translate(isKidsTreatment ? "Description.Mistake.Kids" : "Description.Mistake.V3")}
      </p>
      <Button variant="Standard" size="Small" onClick={handleAppealsClick}>
        {translate("Action.SendAppeal")}
      </Button>
      {punishmentData.showAppealsProcessLink && (
        <AppealsProcessPageItem punishmentData={punishmentData} size="Large" />
      )}
    </div>
  );
};

const ReportMistakePageItemConfig: NAPageItemConfigType = {
  getIsVisible: (_, pageName, commutationEligibility) => {
    const isEducationalPassEligible = commutationEligibility?.educational_pass_eligible ?? false;
    return !isEducationalPassEligible || pageName === StaticPageName.SecondChanceIntro;
  },
  renderComponent: ReportMistakePageItem,
  configName: "report-mistake",
};

export default ReportMistakePageItemConfig;
