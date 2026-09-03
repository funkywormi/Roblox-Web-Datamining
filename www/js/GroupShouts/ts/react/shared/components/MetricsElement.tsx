import { cloneElement, FC, useRef, useEffect, Attributes, useCallback, ReactElement } from 'react';

import CommunityEventStream, { StructuredEvent } from '../utils/eventStream';

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
      // eslint-disable-next-line no-void
      void CommunityEventStream.sendEvent(metric);
    }
  }, [isReady, isOneTimeEvent, metric]);
  const handleClick = useCallback(
    (e: unknown) => {
      if (isOneTimeEvent) {
        return;
      }

      // eslint-disable-next-line no-void
      void CommunityEventStream.sendEvent(metric);
    },
    [isOneTimeEvent, metric]
  );

  if (!children || isOneTimeEvent) {
    return null;
  }

  let originalOnClick: ((e: React.MouseEvent) => void) | undefined;
  if (children && typeof children === 'object' && 'props' in children) {
    originalOnClick = (children.props as { onClick?: (e: React.MouseEvent) => void }).onClick;
  }

  const propsWithClick = {
    ...props,
    onClick: (e: React.MouseEvent) => {
      originalOnClick?.(e);
      handleClick(e);
    }
  } as Attributes;

  return cloneElement(children, propsWithClick);
};

export default MetricsElement;
