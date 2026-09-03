import React, { useEffect, useMemo, useState } from "react";
import { TSduiComponentWrapperProps } from "./wrapComponentForSdui";

import extractResponsivePropOverrides from "./extractResponsivePropOverrides";

type TSduiResponsiveWrapperProps = {
  wrappedComponent: React.ComponentType<TSduiComponentWrapperProps>;
} & TSduiComponentWrapperProps;

const SduiResponsiveWrapper = ({
  wrappedComponent,
  componentConfig,
  parentAnalyticsContext,
  sduiContext,
  localAnalyticsData,
  extraLocalProps,
}: TSduiResponsiveWrapperProps): JSX.Element => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const responsivePropOverrides: Record<string, unknown> = useMemo(() => {
    return extractResponsivePropOverrides(
      componentConfig.responsiveProps,
      windowWidth,
      sduiContext,
    );
  }, [componentConfig.responsiveProps, windowWidth, sduiContext]);

  return React.createElement(wrappedComponent, {
    componentConfig,
    parentAnalyticsContext,
    sduiContext,
    localAnalyticsData,
    extraLocalProps,
    responsivePropOverrides,
  });
};

export default SduiResponsiveWrapper;
