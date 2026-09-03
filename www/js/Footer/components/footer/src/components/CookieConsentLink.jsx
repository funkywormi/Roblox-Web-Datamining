import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useConsentTools } from "@rbx/cookie-banner-v3";
import cookieConsentConstants from "../constants/cookieConsentConstants";
import cookieBannerServices from "../services/cookieBannerServices";

function CookieConsentLink({ translate }) {
  const [nonEssentialCookieList, updateNonEssentialCookieList] = useState([]);
  const [essentialCookieList, updateEssentialCookieList] = useState([]);

  useEffect(() => {
    const updateCookiePolicy = async () => {
      const cookiePolicy = await cookieBannerServices.getCookiePolicy();
      if (cookiePolicy.ShouldDisplayCookieBannerV3 && cookiePolicy.NonEssentialCookieList) {
        updateNonEssentialCookieList(cookiePolicy.NonEssentialCookieList);
        updateEssentialCookieList(cookiePolicy.EssentialCookieList);
      }
    };
    updateCookiePolicy();
  }, []);
  const [consentTool, consentToolService] = useConsentTools({
    nonEssentialCookieList,
    essentialCookieList,
    translate,
  });
  if (essentialCookieList.length > 0) {
    return (
      <div>
        <button
          onClick={consentToolService.open}
          className="btn text-footer-nav footer-button-link"
          type="button"
          data-testid="cookie-consent-link"
        >
          {translate(cookieConsentConstants.consentLinkText)}
        </button>
        {consentTool}
      </div>
    );
  }
  return null;
}

CookieConsentLink.propTypes = { translate: PropTypes.func.isRequired };
export default CookieConsentLink;
