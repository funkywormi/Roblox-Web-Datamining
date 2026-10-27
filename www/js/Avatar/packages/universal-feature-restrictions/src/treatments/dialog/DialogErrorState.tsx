import { Button, Icon } from "@rbx/foundation-ui";
import { useUniversalFeatureRestrictionsConfig } from "../../contexts/UniversalFeatureRestrictionsConfigContext";

interface Props {
  onDismiss: () => void;
}

/**
 * Chrome-less error state for the feature-restriction surface.
 *
 * Rendered when the moderation detail can't be loaded. It mirrors the layout of the ready dialog
 * content (scrollable middle + pinned action) so it fills the host's height without shifting it, and
 * gives the user a way to dismiss the surface.
 */
const DialogErrorState = ({ onDismiss }: Props) => {
  const { translate } = useUniversalFeatureRestrictionsConfig();

  return (
    <div className="flex flex-col gap-medium height-full min-height-0">
      <div className="grow-1 flex flex-col items-center justify-center gap-medium padding-xxlarge min-height-[200px]">
        <Icon name="icon-regular-triangle-exclamation" size="XLarge" />
        <span className="text-body-large content-emphasis margin-none">
          {translate("Heading.Error")}
        </span>
      </div>

      <div className="shrink-0">
        <Button variant="Emphasis" size="Medium" className="width-full" onClick={onDismiss}>
          {translate("Action.OK")}
        </Button>
      </div>
    </div>
  );
};

export default DialogErrorState;
