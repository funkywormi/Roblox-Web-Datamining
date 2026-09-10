import { useEffect } from "react";
import useSettingsModal from "../../../common/hooks/modals/useSettingsModal";
import magicLinkTranslationConstants from "../../constants/contentConstants/magicLinkTranslationConstants";
import {
  getBodyTranslationKey,
  getLoginUrlWithoutMagicLink,
  getMagicLinkLoginUrl,
  getSettingsUrlWithoutMagicLinkToken,
  logoutAllAccountsForMagicLink,
  type TMagicLinkSwitchAccountModalVariant,
} from "../../utils/magicLinkUtils";

const { switchAccountModal } = magicLinkTranslationConstants;

/**
 * Where "switch account" sends the parent after signing every account out. A still-valid link
 * travels along so /login can auto-submit it, but an expired one is dropped: replaying it would
 * only fail redemption again and surface a second expired-link error on the login page.
 */
export const getSwitchAccountLoginUrl = (
  variant: TMagicLinkSwitchAccountModalVariant,
  location: Location = window.location,
): string | undefined =>
  variant === "expired" ? getLoginUrlWithoutMagicLink(location) : getMagicLinkLoginUrl(location);

/**
 * Rendered in place of the settings app when a magic link belongs to an account other than the
 * one signed in. Switching signs every account out on this device so the parent can sign in as
 * the account the email was sent to and land back on the settings page it pointed at.
 */
const MagicLinkSwitchAccountModal = ({
  variant,
}: {
  variant: TMagicLinkSwitchAccountModalVariant;
}): JSX.Element => {
  const returnToSettings = (): void => {
    window.location.replace(getSettingsUrlWithoutMagicLinkToken(window.location));
  };

  const [modal, modalService] = useSettingsModal({
    titleResourceId: switchAccountModal.title,
    bodyResourceId: getBodyTranslationKey(variant),
    actionButtonTextResourceId: switchAccountModal.actionBtnText,
    neutralButtonTextResourceId: switchAccountModal.neutralBtnText,
    size: "sm",
    closeable: false,
    shouldCloseModalOnActionButton: false,
    onAction: () => {
      const loginUrl = getSwitchAccountLoginUrl(variant, window.location);
      if (!loginUrl) {
        returnToSettings();
        return;
      }

      logoutAllAccountsForMagicLink()
        .then(() => {
          window.location.href = loginUrl;
        })
        .catch(returnToSettings);
    },
    onNeutral: returnToSettings,
  });

  useEffect(() => {
    modalService.open();
  }, [modalService]);

  return modal;
};

export default MagicLinkSwitchAccountModal;
