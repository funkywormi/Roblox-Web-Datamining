import { useTranslations } from "@rbx/www-common/i18n";
import { Button as FoundationButton } from "@rbx/foundation-ui";
import layoutConstants from "../constants/layoutConstants";

const { mainContentId } = layoutConstants;

export default function SkipToMainContent() {
  const t = useTranslations("Common.AlertsAndOptions");
  const label = t.has("Action.SkipToMainContent")
    ? t("Action.SkipToMainContent")
    : "Skip to main content";
  // Resolved on click: the target mounts outside this tree.
  const focusMainContent = () => {
    document.getElementById(mainContentId)?.focus();
  };

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
