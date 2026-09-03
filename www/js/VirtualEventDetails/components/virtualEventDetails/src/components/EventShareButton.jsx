import React from "react";
import PropTypes from "prop-types";
import { withTranslations } from "@rbx/core-scripts/legacy/react-utilities";
import { translation } from "../translation.config";
import { getTranslationStringForKeyWithFallback } from "../constants";

import "../css/virtualEventDetails/virtualEventShareButton.scss";

function EventShareButton({ translate, onShareButtonClicked }) {
  return (
    <button
      type="button"
      className="virtual-event-share-button"
      data-testid="share-button"
      onClick={onShareButtonClicked}
      aria-label={getTranslationStringForKeyWithFallback(translate, "ShareModalTitle")}
    >
      <span className="icon-currently-playing-sm" />
    </button>
  );
}

EventShareButton.propTypes = {
  translate: PropTypes.func.isRequired,
  onShareButtonClicked: PropTypes.func.isRequired,
};

export default withTranslations(EventShareButton, translation);
