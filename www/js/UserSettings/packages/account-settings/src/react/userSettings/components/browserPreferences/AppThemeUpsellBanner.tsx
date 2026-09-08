import { useEffect, useRef } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { Link } from "@rbx/foundation-ui";
import {
  appThemeUpsellText,
  appThemeSubscribeText,
} from "../../constants/contentConstants/browserPreferencesTranslationConstants";

export default function AppThemeUpsellBanner({
  onFirstMount,
  onSubscribe,
}: {
  onFirstMount: () => void;
  onSubscribe: () => void;
}) {
  const { translate } = useTranslation();

  const firstMount = useRef(true);
  useEffect(() => {
    if (!firstMount.current) {
      return;
    }
    firstMount.current = false;
    onFirstMount();
  }, [onFirstMount]);

  return (
    <div
      data-testid="app-theme-upsell"
      className="flex items-center gap-large padding-medium bg-shift-200 radius-medium"
    >
      <span className="fill text-body-medium content-emphasis">
        {translate(appThemeUpsellText)}
      </span>
      <Link as="button" size="Small" underline="always" onClick={onSubscribe}>
        {translate(appThemeSubscribeText)}
      </Link>
    </div>
  );
}
