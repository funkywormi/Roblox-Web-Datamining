import { Snackbar } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import type { TChatFeedback } from "../../types/chat";

type TSystemFeedbackProps = {
  feedback: TChatFeedback | null;
  onClose: () => void;
};

const SystemFeedback = ({ feedback, onClose }: TSystemFeedbackProps) => {
  const { translate } = useTranslation();

  if (!feedback) {
    return null;
  }

  return (
    <Snackbar
      key={feedback.id}
      title={feedback.message}
      icon={feedback.type === "success" ? "icon-filled-check" : "icon-filled-circle-i"}
      onClose={onClose}
      closeIconAriaLabel={translate("Label.Close")}
    />
  );
};

export default SystemFeedback;
