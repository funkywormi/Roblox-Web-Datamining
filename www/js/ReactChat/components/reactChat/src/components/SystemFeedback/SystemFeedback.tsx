import { Snackbar } from "@rbx/foundation-ui";
import useChatTranslate from "../../hooks/useChatTranslate";
import type { TChatFeedback } from "../../types/chat";

type TSystemFeedbackProps = {
  feedback: TChatFeedback | null;
  onClose: () => void;
};

const SystemFeedback = ({ feedback, onClose }: TSystemFeedbackProps) => {
  const translate = useChatTranslate();

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
