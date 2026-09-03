import { useTranslation } from "@rbx/core-scripts/react";
import { PlatformEvidenceFullyTyped } from "../../util/types";
import safeTranslateWithParams from "../../util/translation/safeTranslateWithParams";
import { formatter } from "../../util/dateTime";
import FixedImageWithSpinner from "./FixedImageWithSpinner";
import EvidenceField from "../EvidenceField";

interface Props {
  evidence: PlatformEvidenceFullyTyped;
  createTime: string;
}

/**
 * Displays the platform evidence for a violation. This is the preferred way to display evidence moving
 * forward.
 */
const PlatformEvidenceInfo = ({ evidence, createTime }: Props) => {
  const { translate } = useTranslation();

  const imageElements: JSX.Element[] = [];
  const textBasedElements: JSX.Element[] = [];

  evidence.elements.forEach(elem => {
    switch (elem.type) {
      case "image":
        imageElements.push(
          <div key={elem.url} className="width-full" style={{ maxWidth: "250px" }}>
            <FixedImageWithSpinner url={elem.url} altLabelKey={elem.labelKey} />
          </div>,
        );
        break;
      case "text":
        textBasedElements.push(
          <EvidenceField
            key={elem.labelKey}
            fieldLabel={translate(elem.labelKey)}
            fieldValue={
              elem.textKey
                ? safeTranslateWithParams(translate, elem.textKey, elem.textKeyParameters)
                : elem.text
            }
            preWrap
          />,
        );
        break;
      case "timestamp":
        textBasedElements.push(
          <EvidenceField
            key={elem.labelKey}
            fieldLabel={translate(elem.labelKey)}
            fieldValue={formatter.getFullDate(elem.unix * 1000)}
          />,
        );
        break;
      default:
        break;
    }
  });

  return (
    <div className="flex flex-wrap gap-x-xxlarge gap-y-medium">
      {/* If there's only one image, we want to display it side-by-side with the text to make use of the space */}
      {imageElements.length === 1 && imageElements[0]}

      <div className="flex flex-col gap-small" data-testid="itemDescription">
        {imageElements.length > 1 && (
          <div className="flex wrap gap-medium width-full">{imageElements}</div>
        )}
        {textBasedElements}
        {createTime && (
          <EvidenceField
            fieldLabel={translate("Label.ReviewDate")}
            fieldValue={formatter.getFullDate(createTime)}
          />
        )}
      </div>
    </div>
  );
};

export default PlatformEvidenceInfo;
