import React from "react";
import Intl from "@rbx/core-scripts/intl";
import {
  TranslationResource,
  TranslationResourceProvider,
} from "@rbx/core-scripts/intl/translation";
import amendHOCDebuggingInfo from "../utils/amendHOCDebuggingInfo";
import { validateTranslationConfig } from "./validateTranslationConfig";
import { TranslationConfig, WithTranslationsProps } from "../intl";

type State = { languageResources: TranslationResource };

/** @deprecated Please use the `useTranslation` hook instead. */
const withTranslations = <P,>(
  WrappedComponent: React.FC<P & WithTranslationsProps>,
  translationConfig: TranslationConfig,
): typeof React.Component<P, State> => {
  const validatedConfig = validateTranslationConfig(translationConfig);
  // TODO: old, migrated code
  // eslint-disable-next-line react/display-name, import-x/no-named-as-default-member
  return class extends React.Component<P, State> {
    private readonly intl: Intl;

    constructor(props: P) {
      super(props);

      this.intl = new Intl();
      this.translate = this.translate.bind(this);

      const translationProvider = new TranslationResourceProvider(this.intl);
      const translationResources = validatedConfig.map(namespace =>
        translationProvider.getTranslationResource(namespace),
      );

      this.state = {
        languageResources: translationProvider.mergeTranslationResources(...translationResources),
      };
    }

    translate(key: string, parameters?: Record<string, unknown>) {
      const { languageResources } = this.state;
      return languageResources.get(key, parameters);
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          translate={(key, params) => this.translate(key, params)}
          intl={this.intl}
        />
      );
    }
  };
};

// eslint-disable-next-line @typescript-eslint/no-deprecated
export default amendHOCDebuggingInfo(withTranslations, "withTranslations");
