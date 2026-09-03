import React from "react";
import { Button } from "@rbx/foundation-ui";
import { useArTranslation } from "../../util/translate/arTranslation";
import { TranslateInputOrString } from "../../util/translate/translate";
import Eyebrow from "../Eyebrow";
import Footer, { type FooterItem } from "../Footer";
import PreviewBox from "../PreviewBox";
import Subtitle, { type SubtitleValue } from "../Subtitle";
import type { ReviewNode as ReviewNodeType } from "../../hooks/abuseSheetFlow/types";
import { useLayoutSlots } from "../LayoutSlots";

/** Summary/review screen with a preview and heading/text detail pairs. */
const ReviewNode = ({
  onNext,
  isSubmitting,
  nextButtonText,
  title,
  subtitle,
  eyebrow,
  preview,
  details,
  footerItems,
}: {
  onNext?: () => void;
  isSubmitting?: boolean;
  nextButtonText: TranslateInputOrString;
  title: TranslateInputOrString;
  subtitle?: SubtitleValue;
  eyebrow?: TranslateInputOrString;
  preview?: ReviewNodeType["preview"];
  details: ReviewNodeType["details"];
  footerItems?: FooterItem[];
}): React.ReactElement => {
  const { translate } = useArTranslation();
  const { Body, Actions, Description } = useLayoutSlots();

  return (
    <React.Fragment>
      <Body>
        <Eyebrow eyebrow={eyebrow} />
        <Description>
          <div>
            <h3 className="text-heading-medium margin-y-none padding-bottom-medium">
              {translate(title)}
            </h3>
            <Subtitle subtitle={subtitle} />
          </div>
        </Description>
        {preview && (
          <div className="padding-bottom-medium">
            <PreviewBox preview={preview} />
          </div>
        )}
        {details.map((detail, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index} className="padding-bottom-medium">
            <div className="text-title-small">{translate(detail.heading)}</div>
            <div className="text-body-small">{translate(detail.text)}</div>
          </div>
        ))}
        <Footer items={footerItems} />
      </Body>
      {onNext && (
        <Actions>
          <Button
            onClick={onNext}
            className="width-full"
            isDisabled={isSubmitting}
            isLoading={isSubmitting}
          >
            {translate(nextButtonText)}
          </Button>
        </Actions>
      )}
    </React.Fragment>
  );
};

export default ReviewNode;
