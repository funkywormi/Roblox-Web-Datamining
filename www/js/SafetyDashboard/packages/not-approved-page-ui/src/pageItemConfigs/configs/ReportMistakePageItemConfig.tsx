import { Button } from "@rbx/foundation-ui";
import { useNotApprovedTranslate } from "../../providers/NotApprovedUIProvider";
import { NAPageItemConfigType, StaticPageName } from "../ConfigTypes";
import useAppealsRedirect from "../../hooks/useAppealsRedirect";

/**
 * A short description that lets the user know that they can appeal their moderation decision.
 */
const ReportMistakePageItem = (): JSX.Element => {
  const translate = useNotApprovedTranslate();
  const { handleAppealsClick } = useAppealsRedirect({ preferViolationDetail: true });

  return (
    <div className="flex flex-col gap-medium">
      <p className="text-body-large">{translate("Description.Mistake.V3")}</p>
      <Button variant="Standard" size="Small" onClick={handleAppealsClick}>
        {translate("Action.SendAppeal")}
      </Button>
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
