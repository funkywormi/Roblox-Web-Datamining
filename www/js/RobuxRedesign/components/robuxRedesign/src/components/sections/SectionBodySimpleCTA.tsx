import { useContext } from "react";
import { Button } from "@rbx/foundation-ui";
import { BaseSectionProps } from "./Section";
import { BuyRobuxPageContext } from "../../contexts/BuyRobuxPageContext";

export type SectionBodySimpleCTAProps = BaseSectionProps & {
  title: string;
  body: string;
  buttonText: string;
  buttonClickHandler: () => void;
};

export function SectionBodySimpleCTA({
  isPrimary,
  title,
  body,
  buttonText,
  buttonClickHandler,
}: SectionBodySimpleCTAProps) {
  const { breakpoint } = useContext(BuyRobuxPageContext);

  return (
    <div className="flex flex-col self-stretch medium:flex-row medium:justify-between medium:items-center">
      <div className="flex flex-col self-stretch gap-small padding-bottom-large medium:padding-bottom-none">
        {/* Section Title */}
        <div className="self-stretch text-heading-small content-emphasis">{title}</div>

        {/* Section Body */}
        <div className="self-stretch text-body-medium content-emphasis">{body}</div>
      </div>

      {/* Section Button */}
      <Button
        onClick={buttonClickHandler}
        className={`text-label-medium ${breakpoint.isAboveInclusive("medium") ? "button-extra-wide" : "width-full"}`}
        size="Medium"
        variant={isPrimary ? "Emphasis" : "Standard"}
      >
        {buttonText}
      </Button>
    </div>
  );
}
