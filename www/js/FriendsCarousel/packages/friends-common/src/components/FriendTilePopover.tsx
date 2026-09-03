import React, { useState, useRef, useCallback } from "react";
import { Popover, PopoverAnchor, PopoverContent } from "@rbx/foundation-ui";

const DROPDOWN_EDGE_PADDING = 24;

interface FriendTilePopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  dropdownWidth: number;
  ariaLabel: string;
}

const FriendTilePopover: React.FC<FriendTilePopoverProps> = ({
  trigger,
  content,
  dropdownWidth,
  ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleMouseLeave = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const { relatedTarget } = event;
    if (relatedTarget == null) {
      setIsOpen(false);
      return;
    }

    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const relatedNode = relatedTarget as Node;
    const isMovingWithinPopover =
      (triggerRef.current?.contains(relatedNode) ?? false) ||
      (contentRef.current?.contains(relatedNode) ?? false);

    if (!isMovingWithinPopover) {
      setIsOpen(false);
    }
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverAnchor asChild>
        {/* Hover-only (no onFocus/onBlur): this menu is additive and duplicated on the profile page, so keyboard/AT users use that path rather than being handed a dialog they can't tab into. */}
        <div ref={triggerRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {trigger}
        </div>
      </PopoverAnchor>
      <PopoverContent
        side="bottom"
        align="center"
        sideOffset={0}
        collisionPadding={DROPDOWN_EDGE_PADDING}
        ariaLabel={ariaLabel}
        onOpenAutoFocus={event => {
          event.preventDefault();
        }}
      >
        <div
          ref={contentRef}
          style={{ width: dropdownWidth }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {content}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FriendTilePopover;
