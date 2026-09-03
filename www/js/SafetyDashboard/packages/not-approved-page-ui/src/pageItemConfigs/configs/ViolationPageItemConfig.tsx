import { useNotApprovedTranslate } from "../../providers/NotApprovedUIProvider";
import { NAPageItemConfigType, PageItemRenderingProps } from "../ConfigTypes";
import isPlatformEvidenceVisibleInView from "../../utils/isPlatformEvidenceVisibleInView";
import { isPlatformElementValid, PlatformElement } from "../../utils/platformEvidenceTypes";
import safeTranslateWithParams from "../../utils/safeTranslateWithParams";
import ImageWithSpinner from "../../components/ImageWithSpinner";
import { useFormatFullDate } from "../../utils/getFormattedFullDate";
import EvidenceField from "../../components/EvidenceField";
import ViewActivityButton from "../../components/ViewActivityButton";
import useSendNotApprovedPageEvent from "../../telemetry/useSendNotApprovedPageEvent";

/**
 * Showcases the platform evidence if there are any valid elements. Generally, this component
 * would display the image if applicable and any text elements associated with the violation
 * (e.g. the abuse type, the asset ID, etc.).
 */
const ViolationPageItem = ({ punishmentData }: PageItemRenderingProps): JSX.Element => {
  const { violation, consequenceTransparencyMessage } = punishmentData;
  const translate = useNotApprovedTranslate();
  const formatFullDate = useFormatFullDate();
  const sendEvent = useSendNotApprovedPageEvent();

  const elements = violation?.evidence?.elements;

  const validElements =
    elements?.filter((element): element is PlatformElement => isPlatformElementValid(element)) ??
    [];

  const imageElements: JSX.Element[] = [];
  const textElements: JSX.Element[] = [];

  validElements.forEach(elem => {
    if (elem.type === "image") {
      imageElements.push(
        <ImageWithSpinner key={elem.url} url={elem.url} altLabelKey={elem.labelKey} />,
      );
      return;
    }

    textElements.push(
      <EvidenceField
        key={elem.labelKey}
        fieldLabel={translate(elem.labelKey)}
        fieldValue={
          elem.textKey
            ? safeTranslateWithParams(translate, elem.textKey, elem.textKeyParameters, sendEvent)
            : (elem.text ?? "")
        }
      />,
    );
  });

  const isImageShown = imageElements.length > 0;

  return (
    <div
      data-testid="violation-grid"
      className="flex flex-col gap-medium medium:flex-row medium:gap-large"
    >
      {isImageShown && (
        <div className="shrink-0 width-[50%] medium:width-full medium:basis-[40%]">
          {imageElements[0]}
        </div>
      )}

      <div className="flex flex-col gap-small width-full">
        {textElements}
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
    </div>
  );
};

const ViolationPageItemConfig: NAPageItemConfigType = {
  getIsVisible: isPlatformEvidenceVisibleInView,
  renderComponent: ViolationPageItem,
  configName: "violation-evidence",
};

export default ViolationPageItemConfig;
