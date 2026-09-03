import { useNotApprovedTranslate } from "../../providers/NotApprovedUIProvider";
import { NAPageItemConfigType, PageItemRenderingProps } from "../ConfigTypes";
import determinePunishmentDescription from "../../utils/determinePunishmentDescription";
import { useNotApprovedPagePunishment } from "../../context/NotApprovedPagePunishmentProvider";

/**
 * Basic description that is displayed right under the main title of the dialog.
 * It contains info about which policy the user violated if applicable.
 */
const PunishmentDescription = ({ punishmentData }: PageItemRenderingProps): JSX.Element => {
  const translate = useNotApprovedTranslate();
  const { violationReasons } = useNotApprovedPagePunishment();
  const { violation, punishmentTypeDescription } = punishmentData;

  const violationType = violation?.evidence?.displayMeta?.capitalizedKey;

  const punishmentDescription = determinePunishmentDescription(
    violationReasons?.translatedReasons ?? [],
    violationType,
    punishmentTypeDescription,
    translate,
  );

  return <span className="text-body-medium">{punishmentDescription}</span>;
};

const PunishmentDescriptionPageItemConfig: NAPageItemConfigType = {
  getIsVisible: () => true,
  renderComponent: PunishmentDescription,
  configName: "punishment-description",
};

export default PunishmentDescriptionPageItemConfig;
