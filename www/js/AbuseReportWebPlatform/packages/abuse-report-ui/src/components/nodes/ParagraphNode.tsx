import React from "react";
import { Button } from "@rbx/foundation-ui";
import { useArTranslation } from "../../util/translate/arTranslation";
import { TranslateInputOrString } from "../../util/translate/translate";
import Eyebrow from "../Eyebrow";
import Footer from "../Footer";
import { useLayoutSlots } from "../LayoutSlots";

/** Show a paragraph of text to the user */
const ParagraphNode = ({
  onNext,
  isSubmitting,
  nextButtonText,
  paragraph,
  title,
  eyebrow,
  footerItems,
}: {
  onNext?: () => void;
  isSubmitting?: boolean;
  nextButtonText: TranslateInputOrString;
  paragraph: TranslateInputOrString;
  title: TranslateInputOrString;
  eyebrow?: TranslateInputOrString;
  footerItems?: TranslateInputOrString[];
}): React.ReactElement => {
  const { translate } = useArTranslation();
  const { Body, Actions, Description } = useLayoutSlots();

  return (
    <React.Fragment>
      <Body>
        <Eyebrow eyebrow={eyebrow} />
        <Description>
          <h3 className="text-heading-medium margin-y-none padding-bottom-medium">
            {translate(title)}
          </h3>
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
