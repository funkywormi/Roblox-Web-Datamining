import React from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { FeatureSduiLandingPage } from "../../common/constants/translationConstants";

interface ErrorPageProps {
  translate: TranslateFunction;
  titleKey: string;
  messageKey: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ titleKey, messageKey, translate }) => {
  return (
    <div className="sdui-landing-error-page">
      <div className="sdui-landing-error-page-content section-content">
        <div className="sdui-landing-error-page-message-container">
          <h3 className="sdui-landing-error-page-title">
            {translate(titleKey) || "Something went wrong"}
          </h3>
          <h4 className="sdui-landing-error-page-message">
            {translate(messageKey) || "Please try again later"}
          </h4>
        </div>
        <img
          alt={translate(FeatureSduiLandingPage.ErrorPageErrorImageAlt) || "Error Image"}
          src="https://images.rbxcdn.com/9281912c23312bc0d08ab750afa588cc.png"
          className="sdui-landing-error-page-image"
        />
        {/* TODO: update cdn image to local image */}
        <div className="sdui-landing-error-page-action-buttons">
          <button
            className="btn-primary-md btn-min-width"
            title={translate(FeatureSduiLandingPage.ActionBack) || "Go to the Previous Page"}
            type="button"
            onClick={() => window.history.back()}
          >
            {translate(FeatureSduiLandingPage.ActionBack) || "Back"}
          </button>
          <button
            className="btn-control-md btn-min-width"
            title={translate(FeatureSduiLandingPage.ActionHome) || "Return Home"}
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            {translate(FeatureSduiLandingPage.ActionHome) || "Home"}
            {/* TODO: update Action.Home to say Login if user is not logged in */}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
