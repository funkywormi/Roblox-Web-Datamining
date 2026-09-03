import React, { useRef, useState } from "react";
import {
  Icon,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@rbx/foundation-ui";
import { VisualItemMetaAction } from "../types/NotificationTemplateTypes";

const metaActionIconMap = {
  report: "icon-regular-triangle-exclamation",
  turnOnNotifications: "icon-regular-bell",
  turnOffNotifications: "icon-regular-bell-slash",
} as const;

type MetaActionIcon = keyof typeof metaActionIconMap;

const isMetaActionIcon = (icon: string | undefined): icon is MetaActionIcon =>
  icon !== undefined && icon in metaActionIconMap;

export type FoundationSendrKebabProps = {
  actions: Array<VisualItemMetaAction>;
  onSelect: (action: VisualItemMetaAction) => void;
  ariaLabel: string;
};

export const FoundationSendrKebab = ({
  actions,
  onSelect,
  ariaLabel,
}: FoundationSendrKebabProps): JSX.Element => {
  const [open, setOpen] = useState(false);
  const lastChangeRef = useRef({ open: false, ts: 0 });
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <span className="sendr-notification-kebab" onClick={e => e.stopPropagation()}>
      <Popover
        open={open}
        onOpenChange={next => {
          const now = Date.now();
          const prev = lastChangeRef.current;
          if (next && !prev.open && now - prev.ts < 250) {
            lastChangeRef.current = { open: false, ts: now };
            return;
          }
          lastChangeRef.current = { open: next, ts: now };
          setOpen(next);
        }}
      >
        <PopoverTrigger asChild>
          <IconButton
            className="bg-none"
            icon="icon-regular-three-dots-vertical"
            ariaLabel={ariaLabel}
            variant="Standard"
            size="Medium"
          />
        </PopoverTrigger>
        <PopoverContent side="bottom" align="end" ariaLabel={ariaLabel}>
          <Menu size="Medium">
            {actions.map(action => {
              const iconName = isMetaActionIcon(action.actionIcon)
                ? metaActionIconMap[action.actionIcon]
                : undefined;
              return (
                <MenuItem
                  key={action.label.text}
                  value={action.label.text}
                  title={action.label.text}
                  leading={iconName ? <Icon name={iconName} /> : undefined}
                  onSelect={() => {
                    setOpen(false);
                    onSelect(action);
                  }}
                />
              );
            })}
          </Menu>
        </PopoverContent>
      </Popover>
    </span>
  );
};

export default FoundationSendrKebab;
