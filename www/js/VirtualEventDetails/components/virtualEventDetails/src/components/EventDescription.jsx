import React from "react";
import PropTypes from "prop-types";

import { withTranslations } from "@rbx/core-scripts/legacy/react-utilities";
import { translation } from "../translation.config";
import translationConstants from "../constants";

import "../css/virtualEventDetails/virtualEventDescription.scss";

function EventDescription({ translate, description }) {
  return (
    <div className="event-description-container" data-testid="event-description">
      <h2>
        {translate(translationConstants.description.translationKey) ||
          translationConstants.description.fallback}
      </h2>
      <p>{description}</p>
    </div>
  );
}

EventDescription.propTypes = {
  description: PropTypes.string,
  translate: PropTypes.func.isRequired,
};

EventDescription.defaultProps = {
  description: "",
};

export default withTranslations(EventDescription, translation);
