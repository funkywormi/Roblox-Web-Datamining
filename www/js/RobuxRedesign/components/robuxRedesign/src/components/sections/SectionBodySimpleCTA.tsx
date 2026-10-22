import { useContext } from "react";
import { Button } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { BaseSectionProps } from "./Section";
import { BuyRobuxPageContext } from "../../contexts/BuyRobuxPageContext";

export type SectionBodySimpleCTAProps = BaseSectionProps & {
  titleTranslationKey: string;
  bodyTranslationKey: string;
  buttonTextTranslationKey: string;
  buttonClickHandler: () => void;
};

export function SectionBodySimpleCTA({
  isPrimary,
  titleTranslationKey,
  bodyTranslationKey,
  buttonTextTranslationKey,
  buttonClickHandler,
}: SectionBodySimpleCTAProps) {
  const { breakpoint } = useContext(BuyRobuxPageContext);
  const { translate } = useTranslation();

  return (
    <div className="flex flex-col self-stretch medium:flex-row medium:justify-between medium:items-center">
      <div className="flex flex-col self-stretch gap-small padding-bottom-large medium:padding-bottom-none">
        {/* Section Title */}
        <div className="self-stretch text-heading-small content-emphasis">
          {translate(titleTranslationKey)}
        </div>

        {/* Section Body */}
        <div className="self-stretch text-body-medium content-emphasis">
          {translate(bodyTranslationKey)}
        </div>
      </div>

      {/* Section Button */}
      <Button
        onClick={buttonClickHandler}
        className={`text-label-medium ${breakpoint.isAboveInclusive("medium") ? "button-extra-wide" : "width-full"}`}
        size="Medium"
        variant={isPrimary ? "Emphasis" : "Standard"}
      >
        {translate(buttonTextTranslationKey)}
      </Button>
    </div>
  );
}
