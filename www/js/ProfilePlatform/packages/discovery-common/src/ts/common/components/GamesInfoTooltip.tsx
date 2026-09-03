import classNames from "classnames";
import React from "react";
import { Tooltip } from "@rbx/core-ui";

type TGamesInfoTooltipProps = {
  tooltipText: string;
  // Placement of the tooltip relative to the target element, e.g. 'right' or 'left'
  placement: string;
  sizeInPx?: number;
  centerIcon?: boolean;
};

const GamesInfoTooltip = ({
  tooltipText,
  placement,
  sizeInPx = 16,
  centerIcon,
}: TGamesInfoTooltipProps): JSX.Element => {
  return (
    <span className={classNames("info-tooltip-container", { "icon-centered": centerIcon })}>
      <Tooltip
        id="games-info-tooltip"
        placement={placement}
        containerClassName={classNames("games-info-tooltip", { "icon-centered": centerIcon })}
        content={tooltipText}
      >
        <svg
          width={sizeInPx}
          height={sizeInPx}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M8.97 5.44H7V4H8.97V5.44Z" fill="currentColor" />
          <path d="M8.94347 11.9999H7.05347V6.37988H8.94347V11.9999Z" fill="currentColor" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM8 14.5C11.5899 14.5 14.5 11.5899 14.5 8C14.5 4.41015 11.5899 1.5 8 1.5C4.41015 1.5 1.5 4.41015 1.5 8C1.5 11.5899 4.41015 14.5 8 14.5Z"
            fill="currentColor"
          />
        </svg>
      </Tooltip>
    </span>
  );
};

GamesInfoTooltip.defaultProps = {
  sizeInPx: 16,
};

export default GamesInfoTooltip;
