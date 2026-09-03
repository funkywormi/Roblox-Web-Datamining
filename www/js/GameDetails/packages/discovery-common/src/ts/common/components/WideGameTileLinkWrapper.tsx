import React from "react";
import { Link } from "@rbx/core-ui";

const WideGameTileLinkWrapper = ({
  wrapperClassName,
  isTileClickEnabled,
  isOnScreen,
  linkUrl,
  onTileClick,
  children,
}: {
  wrapperClassName: string;
  isTileClickEnabled: boolean;
  isOnScreen: boolean;
  linkUrl: string;
  onTileClick?: () => void;
  children: React.ReactNode;
}): JSX.Element => {
  if (isTileClickEnabled) {
    return (
      <Link
        url={linkUrl}
        className={wrapperClassName}
        tabIndex={isOnScreen ? 0 : -1}
        onClick={onTileClick}
      >
        {children}
      </Link>
    );
  }

  return <span className={wrapperClassName}>{children}</span>;
};

WideGameTileLinkWrapper.defaultProps = {
  onTileClick: undefined,
};

export default WideGameTileLinkWrapper;
