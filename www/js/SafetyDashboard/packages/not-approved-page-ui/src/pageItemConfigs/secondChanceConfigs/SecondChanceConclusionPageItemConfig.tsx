import { useNotApprovedTranslate } from "../../providers/NotApprovedUIProvider";
import { NAPageItemConfigType } from "../ConfigTypes";

/**
 * If a user has a Second Chance pass due to their history of good behavior, we show them
 * a conclusion page to ensure they understand that they won't be able to appeal their decision
 * later if they take the pass since this is an "admission of guilt".
 *
 * We offer the user an option to appeal their decision if they due believe that we
 * (Roblox) made a mistake.
 */
const SecondChanceConclusionPageItem = () => {
  const translate = useNotApprovedTranslate();

  return (
    <div className="flex flex-col gap-medium">
      <span className="text-heading-medium">{translate("Heading.SecondChance.Details")}</span>
      <p className="text-body-large">{translate("Description.SecondChance.Details")}</p>
    </div>
  );
};

const SecondChanceConclusionPageItemConfig: NAPageItemConfigType = {
  getIsVisible: () => true,
  renderComponent: SecondChanceConclusionPageItem,
  configName: "second-chance-conclusion",
};

export default SecondChanceConclusionPageItemConfig;
