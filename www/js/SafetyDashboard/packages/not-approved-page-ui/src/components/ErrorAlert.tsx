import { Icon, IconButton } from "@rbx/foundation-ui";
import { useNotApprovedTranslate } from "../providers/NotApprovedUIProvider";

interface Props {
  onClose: () => void;
}

/**
 * Error alert that displays a generic error message letting the user know to try
 * again later.
 */
const ErrorAlert = ({ onClose }: Props) => {
  const translate = useNotApprovedTranslate();

  return (
    <div
      className="width-full flex gap-large items-center justify-between radius-medium padding-medium stroke-system-alert stroke-standard maf-error-alert"
      style={{ backgroundColor: "rgba(255, 0, 0, 0.1)" }}
      data-testid="error-alert"
    >
      <div className="flex gap-small items-center">
        <Icon name="icon-filled-circle-x" className="content-system-alert" />
        <span className="text-body-medium">{translate("Heading.Error")}</span>
      </div>

      <IconButton
        icon="icon-regular-x-small"
        ariaLabel="Close"
        onClick={onClose}
        variant="Utility"
        size="Medium"
        className="content-system-alert shrink-0"
        isCircular
      />
    </div>
  );
};

export default ErrorAlert;
