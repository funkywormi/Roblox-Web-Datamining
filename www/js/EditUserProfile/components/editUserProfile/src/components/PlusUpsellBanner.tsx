import { useTranslation } from "@rbx/core-scripts/react";
import { Icon } from "@rbx/foundation-ui";

type PlusUpsellBannerProps = {
  onUpsellOpen: () => void;
};

export const PlusUpsellBanner = ({ onUpsellOpen }: PlusUpsellBannerProps) => {
  const { translate } = useTranslation();
  return (
    <div
      className="flex items-center justify-between radius-medium stroke-standard stroke-default"
      style={{ padding: "10px 20px" }}
    >
      <span className="flex items-center gap-small content-emphasis text-body-medium">
        <Icon name="icon-regular-roblox-plus" size="Medium" aria-hidden />
        {translate("Label.ProfileFramesUnlockBanner")}
      </span>
      {/* Plain clickable text (not a Foundation Button): the design wants text,
      not a boxed/link-colored button. */}
      <button
        type="button"
        onClick={onUpsellOpen}
        className="text-body-medium content-emphasis"
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          textDecoration: "underline",
        }}
      >
        {translate("Action.Subscribe")}
      </button>
    </div>
  );
};
