import PropTypes from "prop-types";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import { withTranslations } from "@rbx/core-scripts/react";
import LanguageSelector from "../containers/LanguageSelector";
import { translations } from "../../component.json";
import dispatchHybridEventForLanguageChange from "../utils/dispatchHybridEventForLanguageChange";

function AccountSettingsLanguageSelector({ translate }) {
  const isAuthenticatedUser = authenticatedUser?.isAuthenticated;

  const handleLanguageChange = selectedLocale => {
    const { locale } = selectedLocale;
    if (locale) {
      // trigger hybrid event to mobile apps to reload the app shell in new language
      dispatchHybridEventForLanguageChange(locale, () => {
        console.warn(`Language Change Hybrid Event: ${locale}`);
      });
    }
    window.location.reload();
  };

  return (
    <LanguageSelector
      onLanguageChange={handleLanguageChange}
      translate={translate}
      isAuthenticatedUser={isAuthenticatedUser}
    />
  );
}

window.Roblox.AccountSettingsLanguageSelector = AccountSettingsLanguageSelector;

AccountSettingsLanguageSelector.propTypes = {
  translate: PropTypes.func.isRequired,
};

export default withTranslations(AccountSettingsLanguageSelector, translations);
