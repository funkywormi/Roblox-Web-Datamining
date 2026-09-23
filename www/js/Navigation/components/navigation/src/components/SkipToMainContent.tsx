import { useTranslation } from "@rbx/core-scripts/react";
import { Button as CoreUiButton } from "@rbx/core-ui";
import { Button as FoundationButton } from "@rbx/foundation-ui";
import layoutConstants from "../constants/layoutConstants";
import { useIsTopNavFoundation } from "../util/topNavFoundationIxp";

const { mainContentId } = layoutConstants;

export default function SkipToMainContent() {
  const { translate } = useTranslation();
  const isFoundation = useIsTopNavFoundation();
  const label = translate("Action.SkipToMainContent") || "Skip to main content";
  // Resolved on click: the target mounts outside this tree.
  const focusMainContent = () => {
    document.getElementById(mainContentId)?.focus();
  };

  if (isFoundation) {
    return (
      <FoundationButton
        id="skip-to-main-content"
        size="XSmall"
        variant="Emphasis"
        onClick={focusMainContent}
      >
        {label}
      </FoundationButton>
    );
  }

  return (
    <CoreUiButton
      id="skip-to-main-content"
      size={CoreUiButton.sizes.extraSmall}
      variant={CoreUiButton.variants.primary}
      onClick={focusMainContent}
    >
      {label}
    </CoreUiButton>
  );
}
