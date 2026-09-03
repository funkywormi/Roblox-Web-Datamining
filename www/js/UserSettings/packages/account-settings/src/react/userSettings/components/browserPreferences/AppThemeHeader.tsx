import { useTranslation } from "@rbx/core-scripts/react";
import { Badge } from "@rbx/foundation-ui";
import browserPreferencesTranslationConstants from "../../constants/contentConstants/browserPreferencesTranslationConstants";

const constants = browserPreferencesTranslationConstants;

export default function AppThemeHeader({ subtitle }: { subtitle: string }) {
  const { translate } = useTranslation();

  return (
    <div className="flex flex-col gap-xsmall">
      <div className="flex items-center gap-small">
        <span className="text-title-medium content-emphasis">
          {translate(constants.appThemeLabel)}
        </span>
        <Badge label={translate(constants.newBadgeLabel)} />
      </div>
      <p className="text-body-medium content-muted margin-none">{subtitle}</p>
    </div>
  );
}
