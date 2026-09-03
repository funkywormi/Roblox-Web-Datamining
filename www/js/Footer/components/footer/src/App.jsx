import PropTypes from "prop-types";
import { withTranslations } from "@rbx/core-scripts/react";
import { translations } from "../component.json";
import Footer from "./components/Footer";

function App({ translate, intl }) {
  return <Footer translate={translate} intl={intl} />;
}

App.propTypes = {
  translate: PropTypes.func.isRequired,
  intl: PropTypes.shape({ getRobloxLocale: PropTypes.func.isRequired }).isRequired,
};

export default withTranslations(App, translations);
