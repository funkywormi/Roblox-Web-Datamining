import {
  useNotApprovedTranslate,
  useNotApprovedUIConfig,
} from "../../providers/NotApprovedUIProvider";
import { NAPageItemConfigType, PageItemRenderingProps } from "../ConfigTypes";
import { TPunishment } from "../../utils/types";
import { VERIFICATION_CATEGORIES } from "../../utils/constants";
import makeTranslateWithLink from "../../utils/makeTranslateWithLink";

/**
 * If the user has a chargeback violation, and they are eligible for reactivation (first time
 * chargeback offense), we will display this component to the user.
 *
 * If the user is U18, we will let them know that they will need parent verification. If the user
 * is 18+, we will let them know that they will need to verify their email.
 */
const ChargebackStepsPageItem = ({ punishmentData }: PageItemRenderingProps): JSX.Element => {
  const translate = useNotApprovedTranslate();
  const { websiteUrl } = useNotApprovedUIConfig();
  const translateWithLink = makeTranslateWithLink(translate);

  const { verificationCategory } = punishmentData;
  const homePageUrl = `${websiteUrl}/`;

  // Determine if the user is U18 (VPC) or 18+ (Email) and display the appropriate reactivation content.
  const reactivationContent =
    verificationCategory === VERIFICATION_CATEGORIES.VPC
      ? translateWithLink("Label.ParentReactivationNotice", homePageUrl)
      : translateWithLink("Label.EmailReactivationNotice", homePageUrl);

  return (
    <div className="flex flex-col gap-medium">
      <span className="text-heading-medium">{translate("Label.ChargebackNextSteps")}</span>
      {reactivationContent}
    </div>
  );
};

const ChargebackStepsPageItemConfig: NAPageItemConfigType = {
  getIsVisible: (punishmentData: TPunishment) =>
    [VERIFICATION_CATEGORIES.Email, VERIFICATION_CATEGORIES.VPC].includes(
      punishmentData.verificationCategory,
    ),
  renderComponent: ChargebackStepsPageItem,
  configName: "chargeback-steps",
};

export default ChargebackStepsPageItemConfig;
