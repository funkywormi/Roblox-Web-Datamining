import { useTranslation } from "@rbx/core-scripts/react";
import { SheetBody, SheetContent, SheetTitle } from "@rbx/foundation-ui";

import type { FC } from "react";

const LEARN_MORE_HREF = "/plus";

const LearnMoreSheet: FC = () => {
  const { translate } = useTranslation();
  const learnMoreLabel = translate("Label.Learnmore");

  return (
    <SheetContent
      centerSheetSize="Large"
      closeLabel={translate("Action.Close")}
      largeScreenVariant="center"
      mobilePortraitClassName="![height:97vh] ![max-height:97vh]"
    >
      <SheetTitle visuallyHideTitleText>{learnMoreLabel}</SheetTitle>
      <SheetBody hasPaddingX={false}>
        <iframe
          className="width-full medium:[height:88vh] [height:95vh]"
          // `/plus` runs frame-busting JS that would `top.location` the parent
          // away. Omitting `allow-top-navigation` here is the load-bearing
          // bit: the browser silently drops those attempts so the sheet stays
          // in place. The other tokens are what `/plus` needs to function as
          // a same-origin page.
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals"
          src={LEARN_MORE_HREF}
          style={{ border: 0, display: "block", marginTop: "-42px" }}
          title={learnMoreLabel}
        />
      </SheetBody>
    </SheetContent>
  );
};

export default LearnMoreSheet;
