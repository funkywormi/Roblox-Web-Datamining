import { useTranslation } from "@rbx/core-scripts/react";
import { Chip } from "@rbx/foundation-ui";
import browserPreferencesTranslationConstants from "../../constants/contentConstants/browserPreferencesTranslationConstants";
import { appThemeCategories, type AppThemeCategoryId } from "../../constants/appThemes";

const constants = browserPreferencesTranslationConstants;

export default function AppThemeCategoryTabs({
  selectedCategoryId,
  onSelect,
}: {
  selectedCategoryId: AppThemeCategoryId;
  onSelect: (categoryId: AppThemeCategoryId) => void;
}) {
  const { translate } = useTranslation();

  return (
    <div
      className="flex flex-wrap gap-small"
      role="group"
      aria-label={translate(constants.appThemeLabel)}
    >
      {appThemeCategories.map(category => (
        <Chip
          key={category.id}
          text={translate(category.labelKey)}
          size="Small"
          isChecked={category.id === selectedCategoryId}
          onCheckedChange={() => onSelect(category.id)}
        />
      ))}
    </div>
  );
}
