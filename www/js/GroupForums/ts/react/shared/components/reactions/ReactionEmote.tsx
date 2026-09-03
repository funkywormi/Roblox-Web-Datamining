import React, { useCallback, useMemo } from 'react';
import classNames from 'classnames';

export type ReactionEmoteProps = {
  className?: string;
  emoteUrl: string;
  emoteId: string;
  size?: number;
  onClick?: () => void;
};

const getEmoteStyle = ({ emoteUrl, size }: { emoteUrl: string; size?: number }) => {
  return {
    backgroundImage: `url('${emoteUrl}')`,
    ...(size && { width: `${size}px`, height: `${size}px` })
  };
};

const ReactionEmote = ({
  className,
  emoteUrl,
  emoteId,
  size,
  onClick
}: ReactionEmoteProps): JSX.Element => {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!onClick) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  const clickProps = useMemo(
    () =>
      onClick
        ? {
            onClick,
            onKeyDown: handleKeyDown,
            ariaLabel: 'reaction',
            role: 'button'
          }
        : {},
    [onClick, handleKeyDown]
  );

  return (
    <span
      data-testid={`reaction-emote-${emoteId}`}
      className={classNames('reaction-emote', !!onClick && 'reaction-emote-clickable', className)}
      style={getEmoteStyle({ emoteUrl, size })}
      {...clickProps}
    />
  );
};

export default ReactionEmote;
