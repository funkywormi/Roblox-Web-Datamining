import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import { GameSearch } from "@rbx/discovery-common";
import { translations } from "../component.json";

function App(props: WithTranslationsProps) {
  return <GameSearch {...props} />;
}

export default withTranslations(App, translations);
