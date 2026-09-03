import { ProgressBar } from "@rbx/foundation-ui";
import { useNotApprovedTranslate } from "../../providers/NotApprovedUIProvider";
import { usePageNavigation } from "../../context/PageNavigationContext";

/**
 * A progress bar component that shows the user's progress through the pages.
 * Only necessary if the user has educational pages showing up on the NAP.
 */
const HeaderProgressBar = () => {
  const translate = useNotApprovedTranslate();
  const { getProgress } = usePageNavigation();

  const progress = getProgress();

  return (
    <ProgressBar
      value={progress}
      ariaLabel={translate("Label.PageProgress")}
      style={{
        visibility: progress === 0 ? "hidden" : "visible",
      }}
    />
  );
};

export default HeaderProgressBar;
