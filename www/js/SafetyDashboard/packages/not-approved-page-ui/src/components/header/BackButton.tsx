import { IconButton } from "@rbx/foundation-ui";
import { useNotApprovedTranslate } from "../../providers/NotApprovedUIProvider";
import { usePageNavigation } from "../../context/PageNavigationContext";

/**
 * A back button that navigates the user to the previous page.
 */
const BackButton = () => {
  const translate = useNotApprovedTranslate();
  const { goToPreviousPage } = usePageNavigation();

  return (
    <IconButton
      size="Medium"
      variant="Utility"
      icon="icon-filled-chevron-large-left"
      onClick={goToPreviousPage}
      data-testid="back-button"
      className="margin-left-[-12px]"
      ariaLabel={translate("Action.Back")}
    />
  );
};

export default BackButton;
