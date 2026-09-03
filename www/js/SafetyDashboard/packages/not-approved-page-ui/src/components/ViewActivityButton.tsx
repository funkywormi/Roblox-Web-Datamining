import { Button } from "@rbx/foundation-ui";
import {
  useNotApprovedTranslate,
  useNotApprovedUIConfig,
} from "../providers/NotApprovedUIProvider";
import useAppealsRedirect from "../hooks/useAppealsRedirect";

/**
 * A button that routes the user to the appropriate appeals destination via `useAppealsRedirect`.
 * Currently this button is reused accross evidence types (e.g. Violation, Bad Utterances,
 * Simple Moderator Note), however, if there is alignment on one evidence type in the future,
 * this component might not be needed anymore.
 *
 * If the dialog is in read-only mode, the button is not rendered.
 */
const ViewActivityButton = (): JSX.Element | null => {
  const translate = useNotApprovedTranslate();
  const { handleAppealsClick } = useAppealsRedirect();
  const { readOnly } = useNotApprovedUIConfig();

  if (readOnly) {
    return null;
  }

  return (
    <Button onClick={handleAppealsClick} variant="Standard" size="Small">
      {translate("Action.ViewMore")}
    </Button>
  );
};

export default ViewActivityButton;
