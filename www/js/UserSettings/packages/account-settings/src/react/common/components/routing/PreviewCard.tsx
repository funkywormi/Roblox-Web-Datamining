import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";

interface PreviewCardProps {
  title: string;
  linkText?: string;
  linkPath?: string;
  children?: React.ReactNode;
  noPadding?: boolean;
  displayLink?: boolean;
  onClick?: () => void;
}
/* 
  Pass translated text to this component
*/
export const PreviewCard: React.FC<PreviewCardProps> = ({
  title,
  linkText,
  linkPath,
  children,
  noPadding = false,
  displayLink = true,
  onClick = undefined,
}) => {
  return (
    <div className={classNames("preview-card", { "no-padding": noPadding })}>
      <div className="header">
        <h3>{title}</h3>
        {displayLink && linkText && linkPath && (
          <Link to={linkPath} onClick={onClick}>
            {linkText}
          </Link>
        )}
      </div>
      {children}
    </div>
  );
};

export default PreviewCard;
