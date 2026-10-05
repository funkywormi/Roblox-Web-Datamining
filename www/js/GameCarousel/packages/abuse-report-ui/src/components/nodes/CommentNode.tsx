import React, { useRef, useState } from "react";
import { Button, TextArea } from "@rbx/foundation-ui";
import { useArTranslation } from "../../util/translate/arTranslation";
import { mergeTranslationParams, TranslateInputOrString } from "../../util/translate/translate";
import Eyebrow from "../Eyebrow";
import Footer, { type FooterItem } from "../Footer";
import Subtitle, { type SubtitleValue } from "../Subtitle";
import { useLayoutSlots } from "../LayoutSlots";

/** Counts Unicode code points (runes), not UTF-16 code units */
// eslint-disable-next-line e18e/prefer-spread-syntax
export const getCodePointLength = (str: string): number => Array.from(str).length;

// React 17 has no `useId`; use a process-local counter for stable per-mount ids.
let commentNodeLabelIdCounter = 0;
const generateLabelId = () => {
  commentNodeLabelIdCounter += 1;
  return `comment-node-label-${commentNodeLabelIdCounter}`;
};

/** User can enter a comment about the abuse they are reporting */
const CommentNode = ({
  onNext,
  isSubmitting,
  title,
  subtitle,
  eyebrow,
  textAreaLabel,
  textAreaAriaLabel,
  initialValue,
  placeholder,
  nextButtonText,
  maxLength,
  helperText,
  footerItems,
}: {
  onNext?: (userNote?: string) => void;
  isSubmitting?: boolean;
  title: TranslateInputOrString;
  subtitle?: SubtitleValue;
  eyebrow?: TranslateInputOrString;
  textAreaLabel?: TranslateInputOrString;
  textAreaAriaLabel?: TranslateInputOrString;
  initialValue?: string;
  placeholder: TranslateInputOrString;
  nextButtonText: TranslateInputOrString;
  maxLength?: number;
  helperText?: TranslateInputOrString;
  footerItems?: FooterItem[];
}): React.ReactElement => {
  const [textValue, setTextValue] = useState(initialValue ?? "");
  const { translate, translateToStringOnly } = useArTranslation();
  const visibleLabelIdRef = useRef<string>();
  visibleLabelIdRef.current ??= generateLabelId();
  const visibleLabelId = visibleLabelIdRef.current;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextValue(e.target.value);
  };

  const isOverLimit = Boolean(maxLength && getCodePointLength(textValue) > maxLength);

  const resolvedHelperText = helperText
    ? translateToStringOnly(
        mergeTranslationParams(helperText, {
          currentLength: String(getCodePointLength(textValue)),
          maxLength: String(maxLength),
        }),
      )
    : undefined;

  // Resolve the accessible name. `aria-label` (from `textAreaAriaLabel`)
  // overrides the visible label for assistive tech; otherwise the visible
  // label is announced via `aria-labelledby`.
  const ariaLabel = textAreaAriaLabel ? translateToStringOnly(textAreaAriaLabel) : undefined;
  const ariaLabelledBy = !ariaLabel && textAreaLabel ? visibleLabelId : undefined;

  const { Body, Actions, Description } = useLayoutSlots();

  return (
    <React.Fragment>
      <Body>
        <Eyebrow eyebrow={eyebrow} />
        <Description>
          <div>
            <h3 className="text-heading-medium margin-top-none margin-bottom-small">
              {translate(title)}
            </h3>
            <Subtitle subtitle={subtitle} />
          </div>
        </Description>
        <div className="flex flex-col gap-xsmall">
          {textAreaLabel && (
            <div id={visibleLabelId} className="text-body-small">
              {translate(textAreaLabel)}
            </div>
          )}
          <TextArea
            textareaClassName="[resize:vertical] min-height-900"
            rows={6}
            placeholder={translateToStringOnly(placeholder)}
            value={textValue}
            onChange={handleChange}
            isDisabled={isSubmitting}
            size="Small"
            helperText={resolvedHelperText}
            hasError={isOverLimit}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
          />
        </div>
        <Footer items={footerItems} />
      </Body>
      {onNext && (
        <Actions>
          <Button
            className="width-full"
            onClick={() => {
              onNext(textValue);
            }}
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            isDisabled={isSubmitting || isOverLimit}
            isLoading={isSubmitting}
          >
            {translate(nextButtonText)}
          </Button>
        </Actions>
      )}
    </React.Fragment>
  );
};

export default CommentNode;
