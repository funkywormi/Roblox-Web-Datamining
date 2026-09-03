import { useNotApprovedTranslate } from "../../providers/NotApprovedUIProvider";
import { NAPageItemConfigType } from "../ConfigTypes";

/**
 * On rare occasions, we may grant a user a one-time Second Chance pass for a punishment
 * due to their history of good behavior.
 *
 * We show them an intro page to explain what it is and how it works
 */
const SecondChanceIntroPageItem = () => {
  const translate = useNotApprovedTranslate();

  return (
    <div className="flex flex-col gap-large">
      <span className="text-heading-medium">{translate("Heading.SecondChance")}</span>
      <p className="text-body-large">{translate("Description.SecondChance.Second")}</p>
    </div>
  );
};

const SecondChanceIntroPageItemConfig: NAPageItemConfigType = {
  getIsVisible: () => true,
  renderComponent: SecondChanceIntroPageItem,
  configName: "second-chance-intro",
};

export default SecondChanceIntroPageItemConfig;
