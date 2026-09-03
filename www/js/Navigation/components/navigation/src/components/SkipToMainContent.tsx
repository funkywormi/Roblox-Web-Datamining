import { useTranslation } from "@rbx/core-scripts/react";
import { Button } from "@rbx/core-ui";
import layoutConstants from "../constants/layoutConstants";

const { mainContentId } = layoutConstants;

export default function SkipToMainContent() {
  const { translate } = useTranslation();
  const mainContentElement = document.getElementById(mainContentId);
  return (
    <Button
      id="skip-to-main-content"
      size={Button.sizes.extraSmall}
      variant={Button.variants.primary}
      onClick={() => {
        mainContentElement?.focus();
      }}
    >
      {translate("Action.SkipToMainContent") || "Skip to main content"}
    </Button>
  );
}
