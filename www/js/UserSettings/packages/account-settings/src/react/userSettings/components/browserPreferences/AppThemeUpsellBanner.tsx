import { useTranslation } from "@rbx/core-scripts/react";
import { Button, Icon } from "@rbx/foundation-ui";
import browserPreferencesTranslationConstants from "../../constants/contentConstants/browserPreferencesTranslationConstants";

const constants = browserPreferencesTranslationConstants;

export default function AppThemeUpsellBanner({ onSubscribe }: { onSubscribe: () => void }) {
  const { translate } = useTranslation();

  return (
    <div
      data-testid="app-theme-upsell"
      className="flex items-center justify-between gap-small padding-y-small padding-x-medium radius-medium stroke-standard stroke-default max-width-[410px]"
    >
      <div className="flex items-center gap-small min-width-0">
        <Icon name="icon-regular-roblox-plus" size="Medium" />
        <span className="text-body-medium content-muted">
          {translate(constants.appThemeUpsellText)}
        </span>
      </div>
      <Button size="Small" variant="Link" onClick={onSubscribe}>
        {translate(constants.appThemeSubscribeText)}
      </Button>
    </div>
  );
}
