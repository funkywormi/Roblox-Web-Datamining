import React, { useMemo } from "react";
import SduiComponent from "./SduiComponent";
import { parseProps } from "./parseProps";
import { isValidParsedSduiComponentConfig } from "./SduiParsers";
import logSduiError, { SduiErrorNames } from "../utils/logSduiError";
import {
  TAnalyticsContext,
  TAnalyticsData,
  TRenderedSduiComponentConfig,
  TSduiContext,
  TServerDrivenComponentConfig,
} from "./SduiTypes";

const generateReactChildren = (
  componentConfig: TRenderedSduiComponentConfig,
  parentAnalyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
): JSX.Element[] | null => {
  if (componentConfig.children) {
    return componentConfig.children.map(
      (childConfig: TServerDrivenComponentConfig, index: number): JSX.Element => {
        const id = `${childConfig.componentType ?? "undefined"}-${index}`;
        return (
          <SduiComponent
            key={id}
            componentConfig={childConfig}
            parentAnalyticsContext={parentAnalyticsContext}
            sduiContext={sduiContext}
          />
        );
      },
    );
  }

  return null;
};

const buildAnalyticsContext = (
  componentConfig: TRenderedSduiComponentConfig,
  parentAnalyticsContext: TAnalyticsContext,
  localAnalyticsData?: TAnalyticsData,
): TAnalyticsContext => {
  const { analyticsData } = componentConfig;

  const resultAnalyticsData = {
    ...analyticsData,
    ...(localAnalyticsData ?? {}),
  };

  const { logAction, getCollectionData } = parentAnalyticsContext;

  const ancestorAnalyticsData = {
    ...parentAnalyticsContext.ancestorAnalyticsData,
    ...parentAnalyticsContext.analyticsData,
  };

  return {
    analyticsData: resultAnalyticsData,
    ancestorAnalyticsData,

    // Pass through logAction and getCollectionData to any descendents
    logAction,
    getCollectionData,
  };
};

const buildReactPropsAndChildren = (
  componentConfig: TRenderedSduiComponentConfig,
  parentAnalyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
  localAnalyticsData?: TAnalyticsData,
  extraLocalProps?: Record<string, unknown>,
  responsivePropOverrides?: Record<string, unknown>,
  conditionalPropOverrides?: Record<string, unknown>,
): {
  props: Record<string, unknown>;
  children: React.ReactNode;
} => {
  if (!isValidParsedSduiComponentConfig(componentConfig)) {
    logSduiError(
      SduiErrorNames.SduiComponentBuildPropsAndChildrenInvalidConfig,
      `Invalid component config ${JSON.stringify(
        componentConfig,
      )} to build React props and children`,
      sduiContext.pageContext,
    );

    return {
      props: {},
      children: null,
    };
  }

  const { componentType } = componentConfig;

  const builtAnalyticsContext = buildAnalyticsContext(
    componentConfig,
    parentAnalyticsContext,
    localAnalyticsData,
  );

  const reactProps = {
    ...componentConfig.props,
    componentConfig,
    sduiContext,
    analyticsContext: builtAnalyticsContext,
    ...extraLocalProps,
    ...responsivePropOverrides,
    ...conditionalPropOverrides,
  };

  const parsedProps = parseProps(componentType, reactProps, builtAnalyticsContext, sduiContext);

  const reactChildren = generateReactChildren(componentConfig, builtAnalyticsContext, sduiContext);

  return {
    props: parsedProps,
    children: reactChildren,
  };
};

// Expected input to wrapper / prop parsing operations
export type TSduiComponentWrapperProps = {
  componentConfig: TRenderedSduiComponentConfig;

  parentAnalyticsContext: TAnalyticsContext;

  sduiContext: TSduiContext;

  localAnalyticsData?: TAnalyticsData;

  extraLocalProps?: Record<string, unknown>;

  responsivePropOverrides?: Record<string, unknown>;

  conditionalPropOverrides?: Record<string, unknown>;
};

/**
 * Wraps a component to be used with Server Driven UI
 *
 * The wrapper maps the componentConfig and server props to the React props and children
 * that the wrapped component is expecting to receive
 */
export const wrapComponentForSdui = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.FC<any>,
): React.FC<TSduiComponentWrapperProps> => {
  const WrappedComponent = React.memo((sduiProps: TSduiComponentWrapperProps) => {
    return useMemo(() => {
      const { props, children } = buildReactPropsAndChildren(
        sduiProps.componentConfig,
        sduiProps.parentAnalyticsContext,
        sduiProps.sduiContext,
        sduiProps.localAnalyticsData,
        sduiProps.extraLocalProps,
        sduiProps.responsivePropOverrides,
        sduiProps.conditionalPropOverrides,
      );

      return React.createElement(component, props, children);
    }, [
      sduiProps.componentConfig,
      sduiProps.parentAnalyticsContext,
      sduiProps.sduiContext,
      sduiProps.localAnalyticsData,
      sduiProps.extraLocalProps,
      sduiProps.responsivePropOverrides,
      sduiProps.conditionalPropOverrides,
    ]);
  });

  WrappedComponent.displayName = `SduiWrapped${component.displayName || component.name}`;

  return WrappedComponent;
};

export default wrapComponentForSdui;
