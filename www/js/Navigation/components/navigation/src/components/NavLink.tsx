import { MouseEventHandler, ReactNode } from "react";
import { Link as FoundationLink } from "@rbx/foundation-ui";
import { useNavHref } from "../util/navHref";

type Props = {
  url?: string;
  cssClasses?: string;
  className?: string;
  id?: string;
  onClick?: MouseEventHandler;
  children?: ReactNode;
};

export default function NavLink({ url, cssClasses, className, id, onClick, children }: Props) {
  const toNavHref = useNavHref();
  const classes = [className, cssClasses].filter(Boolean).join(" ") || undefined;

  // isExternal defaults true for any anchor without a _self/_parent/_top target. underline is off
  // to match the sibling nav links, which are static markup in navigationHtml and cannot change
  // until that shell moves into React.
  return (
    <FoundationLink
      href={url == null ? undefined : toNavHref(url)}
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
