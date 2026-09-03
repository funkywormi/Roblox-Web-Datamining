import { cloneElement, FC, useRef, useEffect, Attributes, useCallback, ReactElement } from "react";

import CommunityEventStream, { StructuredEvent } from "../eventStream";

interface MetricsElementProps {
  metric: StructuredEvent;
  children?: ReactElement;
  isReady?: boolean;
  isOneTimeEvent?: boolean;
}

const MetricsElement: FC<MetricsElementProps> = ({
  metric,
  children,
  isReady = true,
  isOneTimeEvent,
  ...props
}) => {
  const hasLoggedExposure = useRef(false);

  useEffect(() => {
    if (isOneTimeEvent && isReady && !hasLoggedExposure.current) {
      hasLoggedExposure.current = true;

      CommunityEventStream.sendEvent(metric);
    }
  }, [isReady, isOneTimeEvent, metric]);
  const handleClick = useCallback(() => {
    if (isOneTimeEvent) {
      return;
    }

    CommunityEventStream.sendEvent(metric);
  }, [isOneTimeEvent, metric]);

  if (!children || isOneTimeEvent) {
    return null;
  }

  let originalOnClick: ((e: React.MouseEvent) => void) | undefined;
  if (children && typeof children === "object" && "props" in children) {
    originalOnClick = (children.props as { onClick?: (e: React.MouseEvent) => void }).onClick;
  }

  const propsWithClick = {
    ...props,
    onClick: (e: React.MouseEvent) => {
      originalOnClick?.(e);
      handleClick();
    },
  } as Attributes;

  return cloneElement(children, propsWithClick);
};

export default MetricsElement;
