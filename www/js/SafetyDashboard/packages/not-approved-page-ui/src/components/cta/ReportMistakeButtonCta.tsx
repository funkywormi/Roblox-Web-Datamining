import { Button } from "@rbx/foundation-ui";
import { useNotApprovedTranslate } from "../../providers/NotApprovedUIProvider";
import useAppealsRedirect from "../../hooks/useAppealsRedirect";

/**
 * Report mistake button CTA for delete punishments.
 * Opens the appeals portal in a new window.
 */
const ReportMistakeButtonCta = (): JSX.Element => {
  const translate = useNotApprovedTranslate();
  const { handleAppealsClick } = useAppealsRedirect();

  return (
    <Button
      variant="SoftEmphasis"
      size="Medium"
      onClick={handleAppealsClick}
      data-testid="appeals-button"
    >
      {translate("Action.ReportMistake")}
    </Button>
  );
};

export default ReportMistakeButtonCta;
