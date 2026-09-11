import { useTranslation } from "@rbx/core-scripts/react";
import { CollectionCarousel } from "@rbx/foundation-ui";

import type { FC, ReactNode } from "react";

export type InteractWithPlusSectionProps = {
  /** One card per engagement surface. Each top-level child becomes a carousel item. */
  children: ReactNode;
};

/**
 * Scrollable rail of things a subscriber can do with Plus. `hasMargin` is off because the page
 * container already supplies the horizontal padding.
 */
const InteractWithPlusSection: FC<InteractWithPlusSectionProps> = ({ children }) => {
  const { translate } = useTranslation();
  const heading = translate("Heading.InteractWithPlus", undefined, "Get more out of Plus");

  return (
    <div className="gap-y-large flex flex-col">
      <span className="text-heading-small content-emphasis">{heading}</span>
      <CollectionCarousel aria-label={heading} hasMargin={false}>
        {children}
      </CollectionCarousel>
    </div>
  );
};

export default InteractWithPlusSection;
