import { JSX, useEffect, useState } from "react";
import { Button, Icon } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { isPushEnabled } from "../services/notificationService";
import { getPushNotificationUpsellEnabled } from "../services/guacService";
import translationConstants from "../constants/translationConstants";

export const EnableNotificationsPrompt = (): JSX.Element | null => {
  const { translate } = useTranslation();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkEligibility = async () => {
      try {
        const deviceInfo = getDeviceMeta();
        if (!deviceInfo?.isAndroidDevice && !deviceInfo?.isIosDevice) return;

        const [upsellEnabled, pushEnabled] = await Promise.all([
          getPushNotificationUpsellEnabled(),
          isPushEnabled(),
        ]);

        if (!cancelled && upsellEnabled && !pushEnabled) {
          setShowPrompt(true);
        }
      } catch {
        // Silently fail — don't show upsell if anything goes wrong
      }
    };

    // eslint-disable-next-line no-void
    void checkEligibility();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!showPrompt) return null;

  const handleEnable = () => {
    const hybrid = (window as { Roblox?: { Hybrid?: Roblox["Hybrid"] } }).Roblox?.Hybrid;
    if (hybrid?.Push?.pushPermissionTrigger) {
      hybrid.Push.pushPermissionTrigger("enableAuthorizationForUser");
      setShowPrompt(false);
    }
  };

  const hybrid = (window as { Roblox?: { Hybrid?: Roblox["Hybrid"] } }).Roblox?.Hybrid;

  return (
    <div className="margin-top-medium margin-bottom-small padding-medium radius-small bg-surface-100 flex flex-col gap-medium">
      <div className="flex flex-row items-center gap-small">
        <Icon name="icon-regular-bell" size="Small" />
        <p className="content-emphasis text-title-medium">
          {translate(translationConstants.notificationsDisabledLabel)}
        </p>
      </div>
      <p className="content-default text-body-medium">
        {translate(translationConstants.notificationsDisabledDescription)}
      </p>

      {hybrid?.Push?.pushPermissionTrigger && (
        <Button variant="Standard" size="Medium" onClick={handleEnable}>
          {translate(translationConstants.actionEnable)}
        </Button>
      )}
    </div>
  );
};

export default EnableNotificationsPrompt;
