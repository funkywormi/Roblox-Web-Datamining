import React, { useMemo } from "react";
import logSduiError, { SduiErrorNames } from "../utils/logSduiError";
import { getComponentFromType } from "./SduiComponentRegistry";
import SduiResponsiveWrapper from "./SduiResponsiveWrapper";
import SduiConditionalWrapper from "./SduiConditionalWrapper";
import { isValidParsedSduiComponentConfig } from "./SduiParsers";
import {
  TAnalyticsContext,
  TAnalyticsData,
  TSduiContext,
  TServerDrivenComponentConfig,
} from "./SduiTypes";

type TSduiComponentProps = {
  componentConfig: TServerDrivenComponentConfig;

  parentAnalyticsContext: TAnalyticsContext;

  sduiContext: TSduiContext;

  localAnalyticsData?: TAnalyticsData;

  extraLocalProps?: Record<string, unknown>;

  responsivePropOverrides?: Record<string, unknown>;
};

/**
 * Renders an SDUI component based on the component config
 * The component to render should be registered in SduiComponentMapping
 * and contain handling (through wrapComponentForSdui) to map the server config to the component props
 */
const SduiComponent = ({
  componentConfig,
  parentAnalyticsContext,
  sduiContext,
  localAnalyticsData,
  extraLocalProps,
}: TSduiComponentProps): JSX.Element => {
  const resolvedComponentConfig = useMemo(() => {
    if (componentConfig.templateKey) {
      return sduiContext.templateRegistry.resolveTemplateForConfig(componentConfig);
    }

    return componentConfig;
  }, [componentConfig, sduiContext]);

  const toRender = useMemo(() => {
    if (!isValidParsedSduiComponentConfig(resolvedComponentConfig)) {
      logSduiError(
        SduiErrorNames.SduiComponentBuildPropsAndChildrenInvalidConfig,
        `Invalid component config ${JSON.stringify(
          resolvedComponentConfig,
        )} to build React props and children`,
        sduiContext.pageContext,
      );

      return <React.Fragment />;
    }

    const { componentType } = resolvedComponentConfig;

    const componentToRender = getComponentFromType(componentType);

    if (!componentToRender) {
      logSduiError(
        SduiErrorNames.ComponentNotFound,
        `Component not found for type ${componentType} using config ${JSON.stringify(
          resolvedComponentConfig,
        )}`,
        sduiContext.pageContext,
      );

      return <React.Fragment />;
    }

    if (resolvedComponentConfig.conditionalProps) {
      return (
        <SduiConditionalWrapper
          wrappedComponent={componentToRender}
          componentConfig={resolvedComponentConfig}
          parentAnalyticsContext={parentAnalyticsContext}
          sduiContext={sduiContext}
          localAnalyticsData={localAnalyticsData}
          extraLocalProps={extraLocalProps}
        />
      );
    }

    if (resolvedComponentConfig.responsiveProps) {
      return (
        <SduiResponsiveWrapper
          wrappedComponent={componentToRender}
          componentConfig={resolvedComponentConfig}
          parentAnalyticsContext={parentAnalyticsContext}
          sduiContext={sduiContext}
          localAnalyticsData={localAnalyticsData}
          extraLocalProps={extraLocalProps}
        />
      );
    }

    return React.createElement(componentToRender, {
      componentConfig: resolvedComponentConfig,
      parentAnalyticsContext,
      sduiContext,
      localAnalyticsData,
      extraLocalProps,
    });
  }, [
    resolvedComponentConfig,
    parentAnalyticsContext,
    sduiContext,
    localAnalyticsData,
    extraLocalProps,
  ]);

  return toRender;
};

export default SduiComponent;
