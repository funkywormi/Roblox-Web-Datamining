import type { ComponentProps } from "react";
import { Icon } from "@rbx/foundation-ui";

const sizeConfig = {
  XSmall: { containerSize: "height-600 width-600", iconSize: "Small" },
  Small: { containerSize: "height-800 width-800", iconSize: "Medium" },
} satisfies Record<
  string,
  { containerSize: string; iconSize: ComponentProps<typeof Icon>["size"] }
>;

type UserAvatarProps = {
  thumbnailUrl: string | null | undefined;
  displayName: string;
  size: keyof typeof sizeConfig;
  className?: string;
};

export function UserAvatar({ thumbnailUrl, displayName, size, className = "" }: UserAvatarProps) {
  const { containerSize, iconSize } = sizeConfig[size];

  return (
    <div
      className={`${containerSize} radius-circle clip flex items-center justify-center shrink-0 ${className}`}
    >
      {thumbnailUrl ? (
        <img src={thumbnailUrl} alt={displayName} className="height-full width-full object-cover" />
      ) : (
        <Icon name="icon-regular-person" size={iconSize} />
      )}
    </div>
  );
}
