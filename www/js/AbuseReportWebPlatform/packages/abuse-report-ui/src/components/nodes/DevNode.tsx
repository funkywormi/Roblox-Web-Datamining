import React from "react";
import { Button } from "@rbx/foundation-ui";
import { useArTranslation } from "../../util/translate/arTranslation";
import { TranslateInputOrString } from "../../util/translate/translate";
import Eyebrow from "../Eyebrow";
import Footer from "../Footer";
import PreviewBox from "../PreviewBox";
import type { DevNode as DevNodeType } from "../../hooks/abuseSheetFlow/types";
import { useLayoutSlots } from "../LayoutSlots";

/** Paragraph-like node with optional preview support (for development/testing) */
const DevNode = ({
  onNext,
  isSubmitting,
  nextButtonText,
  paragraph,
  title,
  eyebrow,
  preview,
  footerItems,
}: {
  onNext?: () => void;
  isSubmitting?: boolean;
  nextButtonText: TranslateInputOrString;
  paragraph: TranslateInputOrString;
  title: TranslateInputOrString;
  eyebrow?: TranslateInputOrString;
  preview?: DevNodeType["preview"];
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
        {preview && (
          <div className="padding-bottom-medium">
            <PreviewBox preview={preview} />
          </div>
        )}
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

export default DevNode;
