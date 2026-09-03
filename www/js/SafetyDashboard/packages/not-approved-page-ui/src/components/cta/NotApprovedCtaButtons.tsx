import { usePageNavigation } from "../../context/PageNavigationContext";
import { TPunishment } from "../../utils/types";

type Props = {
  punishmentData: TPunishment;
  setIsDialogOpen: (isOpen: boolean) => void;
};

/**
 * Renders the CTA buttons for the current page.
 *
 * This component is now a simple wrapper that renders the current page's
 * CTA component. Each page defines its own CTA component in generatePages.ts.
 */
const NotApprovedCtaButtons = ({ punishmentData, setIsDialogOpen }: Props): JSX.Element | null => {
  const { CurrentCtaComponent, currentPageName } = usePageNavigation();
  return CurrentCtaComponent ? (
    <div className="flex flex-col gap-large justify-between medium:items-end">
      <CurrentCtaComponent
        key={currentPageName}
        punishmentData={punishmentData}
        setIsDialogOpen={setIsDialogOpen}
      />
    </div>
  ) : null;
};

export default NotApprovedCtaButtons;
