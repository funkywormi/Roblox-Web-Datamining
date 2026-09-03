import React from "react";
import { WithTranslationsProps, withTranslations } from "@rbx/core-scripts/legacy/react-utilities";
import { supportChatTranslationConfig } from "../../../app.config";
import "./SupportPageContainer.scss";

const SupportPageContainer: React.FC<WithTranslationsProps> = ({ translate: t, children }) => {
  return (
    <div className="c3-support-page-container">
      <h1 className="container-header">{t("Heading.PageTitle")}</h1>
      {children}
    </div>
  );
};

export default withTranslations(SupportPageContainer, supportChatTranslationConfig);
