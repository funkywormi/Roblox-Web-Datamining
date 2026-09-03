import { Button } from "@rbx/foundation-ui";
import { EventTypes } from "../../telemetry/analytics";
import { useNotApprovedTranslate } from "../../providers/NotApprovedUIProvider";
import { NAPageItemConfigType, PageItemRenderingProps } from "../ConfigTypes";
import {
  COMMUNITY_STANDARDS_URL,
  PUNISHMENT_TYPE,
  UGC_GUIDELINES_URL,
} from "../../utils/constants";
import { TPunishment } from "../../utils/types";
import useSendNotApprovedPageEvent from "../../telemetry/useSendNotApprovedPageEvent";
import { usePageNavigation } from "../../context/PageNavigationContext";

/**
 * Shown to users if their account was not deleted (terminated). The component highlights the steps
 * a user can take to prevent any suspensions or longer suspensions from happening in the future.
 *
 * The idea here is to nudge to user to learn about the rules (if applicable) and hopefully prevent them from
 * reoffending in the future.
 */
const PreventionStepsPageItem = ({ punishmentData }: PageItemRenderingProps): JSX.Element => {
  const translate = useNotApprovedTranslate();
  const sendEvent = useSendNotApprovedPageEvent();
  const { hasEducationalPages } = usePageNavigation();

  const { showUGCAvatarGuidelinesLink, context } = punishmentData;

  /**
   * We need to show the button if the user has a UGC Avatar Guidelines violation since the guidelines are not covered
   * in the Community Standards. We also don't need to show the button if the user has educational pages since the
   * educational pages will cover the rules that the user broke.
   */
  const showRulesButton = Boolean(showUGCAvatarGuidelinesLink) || !hasEducationalPages;

  /**
   * For interventions that are alt-informed, we need to let the user know that their punishment may have been caused by
   * behavior on other accounts linked to theirs.
   */
  const isAltInformed = context?.IS_ALT_INFORMED;

  return (
    <div className="flex flex-col gap-medium">
      <span className="text-heading-medium">{translate("Label.RuleBreakingAddsUp")}</span>

      <div className="flex flex-col gap-medium">
        <p className="text-body-large">{translate("Description.Foreshadow")}</p>
        {isAltInformed && (
          <p className="text-body-large">{translate("Description.LinkedAccounts")}</p>
        )}
        {showRulesButton && (
          <Button
            as="a"
            href={showUGCAvatarGuidelinesLink ? UGC_GUIDELINES_URL : COMMUNITY_STANDARDS_URL}
            target="_blank"
            rel="noreferrer noopener"
            variant="Standard"
            size="Small"
            onClick={() => {
              sendEvent(
                showUGCAvatarGuidelinesLink
                  ? EventTypes.UGCGuidelinesClicked
                  : EventTypes.CommunityGuidelineClicked,
              );
            }}
          >
            {showUGCAvatarGuidelinesLink
              ? translate("Action.ViewRulesUGCAvatarGuidelines")
              : translate("Action.ViewRules")}
          </Button>
        )}
      </div>
    </div>
  );
};

const PreventionStepsPageItemConfig: NAPageItemConfigType = {
  getIsVisible: (punishmentData: TPunishment) => {
    return punishmentData.punishmentTypeDescription !== PUNISHMENT_TYPE.Delete;
  },
  renderComponent: PreventionStepsPageItem,
  configName: "prevention-steps",
};

export default PreventionStepsPageItemConfig;
