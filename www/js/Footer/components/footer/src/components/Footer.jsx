import PropTypes from "prop-types";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import { DeviceMeta } from "@rbx/core-scripts/legacy/Roblox";
import { pageName, urlService } from "@rbx/core-scripts/legacy/core-utilities";
import { removeUrlLocale } from "@rbx/core-scripts/endpoints";
import CopyrightMessage from "./CopyrightMessage";
import FooterLinks from "./FooterLinks";
import LanguageSelector from "../containers/LanguageSelector";

function Footer(props) {
  const page = pageName.PageNameProvider.getInternalPageName();
  const remainingPath = removeUrlLocale(window.location.pathname);
  const isSignUpOrLandingPage =
    remainingPath.toLowerCase() === "/" ||
    page === "Login" ||
    page === "CreateAccount" ||
    page === "Landing";
  const isAuthenticatedUser = authenticatedUser?.isAuthenticated;
  const deviceMeta = DeviceMeta && new DeviceMeta();
  const isPortableDevice = deviceMeta && (deviceMeta.isPhone || deviceMeta.isTablet);
  const showLanguageSelector = isAuthenticatedUser || isSignUpOrLandingPage;

  const handleLanguageChange = supportedLocale => {
    const { locale, language } = supportedLocale;
    if (isSignUpOrLandingPage && locale) {
      const queryParameters = Object.fromEntries(new URLSearchParams(window.location.search));
      const urlFormatObject = {
        pathname: `/${language.languageCode}${remainingPath === "/" ? "" : remainingPath}`,
        query: queryParameters,
      };
      window.location.href = urlService.formatUrl(urlFormatObject);
    } else {
      window.location.reload();
    }
  };

  const copyrightClassWithLanguageSelector = "col-sm-6 col-md-9";
  const copyrightClass = "col-sm-12";
  const { translate } = props;

  return (
    <div className="footer">
      <FooterLinks {...props} />
      <div className="row copyright-container flex items-center justify-between padding-top-xlarge gutter-x-small">
        <div className="col-sm-6 col-md-3">
          {showLanguageSelector && (
            <LanguageSelector
              translate={translate}
              onLanguageChange={handleLanguageChange}
              isAuthenticatedUser={isAuthenticatedUser}
              showWarningMessageForUnsupportedLocale={false}
              hideSeoUnsupportedLocales={isSignUpOrLandingPage}
              isNative={isPortableDevice}
            />
          )}
        </div>
        <div className={showLanguageSelector ? copyrightClassWithLanguageSelector : copyrightClass}>
          <CopyrightMessage {...props} />
        </div>
      </div>
    </div>
  );
}

Footer.propTypes = {
  translate: PropTypes.func.isRequired,
};

export default Footer;
