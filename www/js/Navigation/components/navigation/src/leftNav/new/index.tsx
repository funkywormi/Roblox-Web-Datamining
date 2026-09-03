import { useCallback, useEffect, useState } from "react";
import classNames from "classnames";
import { AuthenticatedUser } from "@rbx/core-scripts/meta/user";
import { Divider } from "@rbx/foundation-ui";
import NavLinks from "./NavLinks";
import { sendLeftSidebarEvent } from "../../services/eventService";

export default function LeftNavigation({ user }: { user: AuthenticatedUser }) {
  // Changes the value of a CSS variable for the left nav width.
  useEffect(() => {
    const e = document.getElementById("wrap") ?? document.body;
    e.classList.add("left-nav-new-width");
    return () => {
      e.classList.remove("left-nav-new-width");
    };
  });

  const [isOpen, setIsOpen] = useState(false);

  const onClickMenuIcon = useCallback(() => {
    setIsOpen(isOpen => {
      const open = !isOpen;
      sendLeftSidebarEvent(open, "NEW");
      return open;
    });
  }, [setIsOpen]);

  useEffect(() => {
    document.addEventListener("headerMenuIconClick", onClickMenuIcon);
    return () => {
      document.removeEventListener("headerMenuIconClick", onClickMenuIcon);
    };
  }, [onClickMenuIcon]);

  return (
    <div
      className={classNames(
        "left-nav fixed left-[0] [z-index:1001] bg-surface-0",
        "motion-safe:[transition-property:transform,visibility] ease-standard-out duration-100 large:visible large:[transform:unset]",
        isOpen ? "visible" : "invisible [transform:translateX(-100%)]",
      )}
    >
      <div className="flex width-[289px] height-full scroll-y">
        <div className="width-[288px]">
          <div className="padding-x-large padding-y-medium flex flex-col gap-large">
            <NavLinks user={user} />
          </div>
        </div>
        <Divider orientation="vertical" />
      </div>
    </div>
  );
}
