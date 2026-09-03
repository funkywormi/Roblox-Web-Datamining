import React from "react";
import PropTypes from "prop-types";
import { withTranslations, TranslationProvider } from "@rbx/core-scripts/react";
import { translation } from "./app.config";
import HomePageUpsellContainer from "./container/homePageUpsellCardContainer";
import { UpsellCardType } from "./constants/upsellCardConstants";

function App({ translate, context }) {
  return (
    <TranslationProvider config={translation}>
      <HomePageUpsellContainer translate={translate} context={context} />
    </TranslationProvider>
  );
}

App.defaultProps = {
  context: UpsellCardType.ContactMethod,
};

App.propTypes = {
  translate: PropTypes.func.isRequired,
  context: PropTypes.string,
};

export default withTranslations(App, translation);
