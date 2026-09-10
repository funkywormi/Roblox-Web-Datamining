import { useTranslation } from "@rbx/core-scripts/react";

type PlusUpsellBannerProps = {
  onUpsellOpen: () => void;
};

export const PlusUpsellBanner = ({ onUpsellOpen }: PlusUpsellBannerProps) => {
  const { translate } = useTranslation();
  return (
    <div
      className="radius-medium stroke-standard stroke-default flex items-center justify-between"
      style={{ padding: "10px 20px" }}
    >
      <span className="content-emphasis text-body-medium">
        {translate("Label.ProfileFramesUnlockBanner")}
      </span>
      {/* Plain clickable text (not a Foundation Button): the design wants text,
      not a boxed/link-colored button. */}
      <button
        className="text-body-medium content-emphasis"
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          textDecoration: "underline",
        }}
        type="button"
        onClick={onUpsellOpen}
      >
        {translate("Action.Subscribe")}
      </button>
    </div>
  );
};
