import React, { useState } from "react";
import {
  EducationalTooltip,
  EducationalTooltipTrigger,
  EducationalTooltipContent,
  EducationalTooltipBody,
  EducationalTooltipTitle,
  EducationalTooltipDescription,
  EducationalTooltipFullWidthFooter,
  IconButton,
} from "@rbx/foundation-ui";

export interface DisclosureInfoButtonProps {
  ariaLabel: string;
  closeLabel: string;
  title: string;
  text: string;
  buttonLabel?: string;
  defaultOpen?: boolean;
}

/**
 * Disclosure info button that displays educational information in a tooltip.
 * Opens on click and shows title, description, and an optional dismiss button.
 */
const DisclosureInfoButton = ({
  ariaLabel,
  closeLabel,
  title,
  text,
  buttonLabel,
  defaultOpen = false,
}: DisclosureInfoButtonProps): React.ReactElement => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <EducationalTooltip open={open} onOpenChange={setOpen}>
      <EducationalTooltipTrigger asChild>
        <IconButton
          icon="icon-regular-circle-i"
          size="Medium"
          variant="Utility"
          ariaLabel={ariaLabel}
        />
      </EducationalTooltipTrigger>
      <EducationalTooltipContent position="bottom-end" hasCloseAffordance closeLabel={closeLabel}>
        <EducationalTooltipBody>
          <EducationalTooltipTitle>{title}</EducationalTooltipTitle>
          <EducationalTooltipDescription>{text}</EducationalTooltipDescription>
        </EducationalTooltipBody>
        {buttonLabel && (
          <EducationalTooltipFullWidthFooter
            primaryAction={{
              label: buttonLabel,
              onClick: () => {
                setOpen(false);
              },
            }}
          />
        )}
      </EducationalTooltipContent>
    </EducationalTooltip>
  );
};

export default DisclosureInfoButton;
