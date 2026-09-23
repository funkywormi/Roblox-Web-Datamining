import { MouseEventHandler, ReactNode } from "react";
import { Link as CoreUiLink } from "@rbx/core-ui";
import { Link as FoundationLink } from "@rbx/foundation-ui";
import { useIsTopNavFoundation } from "../util/topNavFoundationIxp";

type Props = {
  url?: string;
  cssClasses?: string;
  className?: string;
  id?: string;
  onClick?: MouseEventHandler;
  children?: ReactNode;
};

export default function NavLink({ url, cssClasses, className, id, onClick, children }: Props) {
  const isFoundation = useIsTopNavFoundation();
  const classes = [className, cssClasses].filter(Boolean).join(" ") || undefined;

  // isExternal defaults true for any anchor without a _self/_parent/_top target. underline is off
  // to match the sibling nav links, which are static markup in navigationHtml and cannot change
  // until that shell moves into React.
  if (isFoundation) {
    return (
      <FoundationLink
        href={url}
        id={id}
        onClick={onClick}
        className={classes}
        isExternal={false}
        underline="none"
      >
        {children}
      </FoundationLink>
    );
  }

  return (
    <CoreUiLink url={url} cssClasses={cssClasses} className={className} id={id} onClick={onClick}>
      {children}
    </CoreUiLink>
  );
}
