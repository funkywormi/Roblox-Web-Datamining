import { Button } from "@rbx/foundation-ui";
import { useNotApprovedTranslate } from "../../providers/NotApprovedUIProvider";
import { CtaComponentProps } from "../../pageItemConfigs/ConfigTypes";

/**
 * Simplified CTA for read-only mode that renders a single "OK" button.
 * Clicking the button closes the dialog without triggering any reactivation flow.
 */
const DismissDialogCta = ({ setIsDialogOpen }: CtaComponentProps) => {
  const translate = useNotApprovedTranslate();

  return (
    <Button
      variant="Emphasis"
      size="Medium"
      onClick={() => {
        setIsDialogOpen(false);
      }}
      className="min-width-1800"
      data-testid="dismiss-dialog-button"
    >
      {translate("Action.OK")}
    </Button>
  );
};

export default DismissDialogCta;
