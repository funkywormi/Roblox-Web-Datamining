import type { ComponentProps } from "react";
import { Icon, ListItem, ListItemChevronTrailingAccessory } from "@rbx/foundation-ui";

type PendingRequestRowProps = {
  /** Foundation icon for the circular badge that leads the row. */
  iconName: ComponentProps<typeof Icon>["name"];
  title: string;
  /** Single muted line beneath the title. */
  metadata?: string;
  onSelect: () => void;
};

/**
 * One row in the pending requests list.
 *
 * Every kind of request reads the same way — badge, what it is, what it is worth, chevron — and
 * opens a surface of its own, so they all render through here. Foundation decides how a selectable
 * row is built, which is what keeps the kinds from drifting apart as more are added.
 */
export function PendingRequestRow({ iconName, title, metadata, onSelect }: PendingRequestRowProps) {
  return (
    <ListItem
      /*
       * `padding-x-none`: Foundation only offers medium or xlarge here, and both inset the row
       * from the sheet edges.
       *
       * The vertical padding lives on the leading and content wrappers inside the row, which are
       * hardcoded to `padding-y-large`. Two stacked rows therefore put 32px between their content
       * before the list gap is even counted, which reads far looser than the design. The child
       * selector is the only way in, and it outranks the built-in class on specificity.
       */
      className="padding-x-none [&>div]:padding-y-small"
      divider="None"
      isContained
      leading={
        // 48px badge around a 24px glyph, matching the weight the badge carries in the design
        // against the row's height.
        <span className="bg-shift-200 radius-circle size-1200 flex items-center justify-center">
          <Icon name={iconName} size="Large" />
        </span>
      }
      metadata={metadata}
      size="Medium"
      title={title}
      trailing={<ListItemChevronTrailingAccessory />}
      onSelect={onSelect}
    />
  );
}
