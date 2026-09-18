import React, { createContext, useContext, forwardRef } from "react";
import { SheetBody, SheetActions, SheetDescription } from "@rbx/foundation-ui";

type BodyProps = {
  children?: React.ReactNode;
  className?: string;
  hasPaddingX?: boolean;
};

type ActionsProps = {
  children?: React.ReactNode;
  className?: string;
};

type DescriptionProps = {
  children?: React.ReactNode;
};

export type LayoutSlots = {
  Body: React.ComponentType<BodyProps & React.RefAttributes<HTMLDivElement>>;
  Actions: React.ComponentType<ActionsProps>;
  Description: React.ComponentType<DescriptionProps>;
};

const SheetBodySlot = forwardRef<HTMLDivElement, BodyProps>(
  ({ children, className, hasPaddingX }, ref) => {
    const combinedRef = (el: HTMLDivElement | null) => {
      if (el) {
        el.setAttribute("tabindex", "0");
        el.addEventListener("focus", (e: FocusEvent) => {
          if (e.target === el) {
            const first = el.querySelector<HTMLElement>(
              "button:not([disabled]), .foundation-web-interactable",
            );
            first?.focus();
          }
        });
      }
      if (typeof ref === "function") ref(el);
      // eslint-disable-next-line no-param-reassign
      else if (ref) ref.current = el;
    };

    return (
      <SheetBody
        ref={combinedRef}
        className={`padding-bottom-large fill ${className ?? ""}`}
        hasPaddingX={hasPaddingX}
      >
        {children}
      </SheetBody>
    );
  },
);
SheetBodySlot.displayName = "SheetBodySlot";

/**
 * Sheet-backed layout slots (default). Wraps the real Sheet sub-components
 * from @rbx/foundation-ui with sheet-specific layout classes.
 */
export const sheetSlots: LayoutSlots = {
  Body: SheetBodySlot,
  Actions: SheetActions,
  Description: SheetDescription,
};

const InlineBody = forwardRef<HTMLDivElement, BodyProps>(
  ({ children, className, hasPaddingX = true }, ref) => (
    <div
      ref={ref}
      className={`overflow-y-auto flex-1 ${hasPaddingX ? "padding-x-xlarge" : ""} ${className ?? ""}`}
    >
      {children}
    </div>
  ),
);
InlineBody.displayName = "InlineBody";

const InlineActions: React.FC<ActionsProps> = ({ children, className }) => (
  <div className={`padding-top-medium ${className ?? ""}`}>{children}</div>
);

const InlineDescription: React.FC<DescriptionProps> = ({ children }) => <div>{children}</div>;

export const inlineSlots: LayoutSlots = {
  Body: InlineBody,
  Actions: InlineActions,
  Description: InlineDescription,
};

const LayoutSlotsContext = createContext<LayoutSlots>(sheetSlots);

export const LayoutSlotsProvider = ({
  slots,
  children,
}: {
  slots: LayoutSlots;
  children: React.ReactNode;
}): React.ReactElement => (
  <LayoutSlotsContext.Provider value={slots}>{children}</LayoutSlotsContext.Provider>
);

export const useLayoutSlots = (): LayoutSlots => useContext(LayoutSlotsContext);
