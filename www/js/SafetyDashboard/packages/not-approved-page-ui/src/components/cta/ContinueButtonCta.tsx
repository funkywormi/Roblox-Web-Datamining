import { Button } from "@rbx/foundation-ui";
import { useNotApprovedTranslate } from "../../providers/NotApprovedUIProvider";
import { usePageNavigation } from "../../context/PageNavigationContext";

type ContinueButtonCtaProps = {
  isDisabled?: boolean;
};

/**
 * Simple continue button CTA for advancing to the next page.
 * Used on most intermediate pages in the flow.
 */
const ContinueButtonCta = ({ isDisabled = false }: ContinueButtonCtaProps): JSX.Element => {
  const translate = useNotApprovedTranslate();
  const { goToNextPage } = usePageNavigation();

  return (
    <Button
      variant="Emphasis"
      size="Medium"
      onClick={goToNextPage}
      data-testid="continue-button"
      isDisabled={isDisabled}
    >
      {translate("Action.Continue")}
    </Button>
  );
};

export default ContinueButtonCta;
