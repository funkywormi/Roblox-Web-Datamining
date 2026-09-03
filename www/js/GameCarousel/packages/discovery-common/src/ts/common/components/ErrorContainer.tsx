import React from "react";
import { useTheme, withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import AlertLight from "@rbx/foundation-images/pictograms/alert_light.svg";
import AlertDark from "@rbx/foundation-images/pictograms/alert_dark.svg";
import { Button } from "@rbx/foundation-ui";
import configConstants from "../constants/configConstants";
import "../../../css/common/_errorContainer.scss";

const { errorContainer } = configConstants;

type TErrorContainerProps = {
  errorSubtext: string;
  onRefresh: (() => void) | undefined;
} & WithTranslationsProps;

export const ErrorContainer = ({
  errorSubtext,
  onRefresh,
  translate,
}: TErrorContainerProps): JSX.Element => {
  const theme = useTheme();

  return (
    <div data-testid="error-container" className="discovery-error-container">
      <div className="error-container-content">
        <img
          data-testid="error-container-image"
          className="error-container-content-image"
          src={theme === "dark" ? AlertDark : AlertLight}
          alt=""
        />
        <h2>{translate(errorContainer.somethingWentWrongText)}</h2>
        <p className="error-container-content-subtext">{errorSubtext}</p>
      </div>
      {onRefresh && (
        <Button
          data-testid="error-refresh-button"
          variant="Standard"
          size="Medium"
          onClick={onRefresh}
        >
          <span>{translate(errorContainer.retryText)}</span>
        </Button>
      )}
    </div>
  );
};

const translationConfig = {
  common: ["CommonUI.Messages", "CommonUI.Controls"],
  feature: "",
};

export default withTranslations(ErrorContainer, translationConfig);
