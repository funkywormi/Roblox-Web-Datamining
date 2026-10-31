import { IconButton } from "@rbx/foundation-ui";
import type { PageTarget } from "../types";

const PagerButton = ({
  icon,
  ariaLabel,
  target,
  onChangePage,
}: {
  icon:
    | "icon-filled-chevron-large-left-to-line"
    | "icon-filled-chevron-large-left"
    | "icon-filled-chevron-large-right"
    | "icon-filled-chevron-large-right-to-line";
  ariaLabel: string;
  // Null disables the button.
  target: PageTarget | null;
  onChangePage: (target: PageTarget) => void;
}): React.ReactElement => (
  <IconButton
    icon={icon}
    variant="Utility"
    size="Medium"
    isDisabled={target == null}
    ariaLabel={ariaLabel}
    onClick={() => {
      if (target != null) {
        onChangePage(target);
      }
    }}
  />
);

export default PagerButton;
