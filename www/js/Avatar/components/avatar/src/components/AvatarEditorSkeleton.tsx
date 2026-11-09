import React from "react";
import { useTranslations } from "@rbx/www-common/i18n";

const TAB_COUNT = 6;
const ITEM_CARD_COUNT = 14;

// Foundation classes only, so it renders before the editor CSS loads.
function Block({ className }: { className: string }): React.ReactElement {
  return <div className={`bg-shift-100 ${className}`} />;
}

/** Tabs and item grid placeholder, shown until the startup requests resolve. */
export function AvatarItemsSkeleton(): React.ReactElement {
  const t = useTranslations("Feature.Avatar");
  return (
    <div role="status" aria-label={t("Message.Loading")} className="flex flex-col gap-large">
      <div className="flex gap-small">
        {Array.from({ length: TAB_COUNT }, (_, index) => (
          <Block key={index} className="height-1000 width-[96px] radius-medium" />
        ))}
      </div>
      <div className="flex flex-wrap gap-medium">
        {Array.from({ length: ITEM_CARD_COUNT }, (_, index) => (
          <div key={index} className="flex flex-col gap-small width-[126px]">
            <Block className="height-[126px] radius-medium" />
            <Block className="height-[14px] width-[80%] radius-small" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Whole-editor placeholder while the chunk downloads. The status label lives in AvatarItemsSkeleton. */
export default function AvatarEditorSkeleton(): React.ReactElement {
  return (
    <div
      aria-busy="true"
      className="flex flex-col gap-large width-full max-width-[1238px] margin-x-auto padding-y-large"
    >
      <div className="flex items-center justify-between">
        <Block className="height-[32px] width-[160px] radius-small" />
        <Block className="height-1000 width-[120px] radius-medium" />
      </div>
      <div className="flex gap-large">
        <Block className="shrink-0 height-[352px] width-[277px] radius-medium" />
        <div className="grow">
          <AvatarItemsSkeleton />
        </div>
      </div>
    </div>
  );
}
