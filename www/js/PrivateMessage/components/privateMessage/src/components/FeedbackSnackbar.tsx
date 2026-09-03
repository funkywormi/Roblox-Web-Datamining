import { Snackbar } from "@rbx/foundation-ui";
import type { FeedbackState } from "../types";

const FeedbackSnackbar = ({
  feedback,
  onClose,
}: {
  feedback: FeedbackState | null;
  onClose: () => void;
}): React.ReactElement | null => {
  if (!feedback) {
    return null;
  }

  return <Snackbar title={feedback.message} onClose={onClose} shouldAutoDismiss />;
};

export default FeedbackSnackbar;
