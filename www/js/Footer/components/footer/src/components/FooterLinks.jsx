import React, { useState } from "react";
import PropTypes from "prop-types";
import ClassNames from "classnames";
import { useQuery } from "@tanstack/react-query";
import { urlService } from "@rbx/core-scripts/legacy/core-utilities";
import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import { linksList, linksListWithGiftCardLabel } from "../constants/footerConstants";
import CookieConsentLink from "./CookieConsentLink";
import YourPrivacyChoicesModal from "./YourPrivacyChoicesModal";
import { getIsYourPrivacyChoicesModalAsync } from "../services/footerUiPolicy";

function sendRobuxFooterEvent(className, event) {
  sendEventWithTarget(
    "PageFooter",
    "click",
    {
      destination: `${className}`,
      source: `${event.currentTarget.ownerDocument.location.pathname}`,
    },
    targetTypes.WWW,
  );
}

function FooterLinks({ translate, intl }) {
  const [showYourPrivacyChoicesModal, setShowYourPrivacyChoicesModal] = useState(false);

  const { data: isYourPrivacyChoicesModalEnabled } = useQuery({
    queryKey: ["isYourPrivacyChoicesModalEnabled"],
    queryFn: getIsYourPrivacyChoicesModalAsync,
    placeholderData: false,
  });

  let linksPointer = linksList;

  let isEnabled = false;
  const element = document.getElementById("footer-container");
  if (element != null) {
    const giftCardsValue = element.getAttribute("data-is-giftcards-footer-enabled");
    if (giftCardsValue != null) {
      isEnabled = giftCardsValue.toLowerCase() === "true";
    }
  }

  if (isEnabled) {
    linksPointer = linksListWithGiftCardLabel;
  }

  const links = linksPointer.map(link => (
    <li key={link.name} className="footer-link">
      {link.name === "your-privacy-choices" && isYourPrivacyChoicesModalEnabled ? (
        <button
          onClick={() => setShowYourPrivacyChoicesModal(true)}
          className="text-footer-nav footer-button-link"
          type="button"
        >
          {translate(link.labelTranslationKey)}
          <img src={link.postfixIcon} alt="" className="footer-postfixIcon" />
        </button>
      ) : (
        <a
          href={urlService.getUrlWithLocale(link.path, intl.getRobloxLocale())}
          className={ClassNames("text-footer-nav", link.cssClass)}
          target="_blank"
          rel="noreferrer"
          onClick={e => sendRobuxFooterEvent(link.name, e)}
        >
          {translate(link.labelTranslationKey)}
          {link.postfixIcon ? (
            <img src={link.postfixIcon} alt="" className="footer-postfixIcon" />
          ) : (
            ""
          )}
        </a>
      )}
    </li>
  ));
  return (
    <React.Fragment>
      <ul className="row footer-links flex flex-wrap justify-center padding-bottom-xxsmall">
        {links}
        <li>
          <CookieConsentLink translate={translate} />
        </li>
      </ul>
      <YourPrivacyChoicesModal
        showModal={showYourPrivacyChoicesModal}
        onModalClose={() => setShowYourPrivacyChoicesModal(false)}
        translate={translate}
        intl={intl}
      />
    </React.Fragment>
  );
}

FooterLinks.propTypes = {
  translate: PropTypes.func.isRequired,
  intl: PropTypes.shape({ getRobloxLocale: PropTypes.func.isRequired }).isRequired,
};

export default FooterLinks;
