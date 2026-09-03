import React from "react";
import { Button } from "@rbx/foundation-ui";
import { useArTranslation } from "../../util/translate/arTranslation";
import { TranslateInputOrString } from "../../util/translate/translate";
import Eyebrow from "../Eyebrow";
import Footer, { type FooterItem } from "../Footer";
import Subtitle, { type SubtitleValue } from "../Subtitle";
import { useLayoutSlots } from "../LayoutSlots";

/** Show a paragraph of text to the user */
const ParagraphNode = ({
  onNext,
  isSubmitting,
  nextButtonText,
  paragraph,
  title,
  subtitle,
  eyebrow,
  footerItems,
}: {
  onNext?: () => void;
  isSubmitting?: boolean;
  nextButtonText: TranslateInputOrString;
  paragraph: TranslateInputOrString;
  title: TranslateInputOrString;
  subtitle?: SubtitleValue;
  eyebrow?: TranslateInputOrString;
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
        <div className="text-body-small padding-bottom-medium">{translate(paragraph)}</div>
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

export default ParagraphNode;
