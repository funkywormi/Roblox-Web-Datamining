import type React from "react";
import { Link } from "@rbx/foundation-ui";
import { useNotApprovedTranslate } from "../../providers/NotApprovedUIProvider";
import { EventTypes } from "../../telemetry/analytics";
import useSendNotApprovedPageEvent from "../../telemetry/useSendNotApprovedPageEvent";
import { appealsProcessUrl } from "../../utils/constants";
import { NAPageItemConfigType, PageItemRenderingProps } from "../ConfigTypes";

type AppealsProcessPageItemProps = PageItemRenderingProps & {
  // The two page layouts use different text sizes due to an apparent design inconsistency.
  // Hopefully this distinction can be removed long term.
  size?: "Medium" | "Large";
};

/**
 * Additional help link for learning about the appeals process generally. The backend enables this
 * disclosure for moderation decisions where EU DSA messaging is required.
 */
export const AppealsProcessPageItem = ({
  size = "Medium",
}: AppealsProcessPageItemProps): React.JSX.Element => {
  const translate = useNotApprovedTranslate();
  const sendEvent = useSendNotApprovedPageEvent();

  return (
    <div data-testid="appeals-process">
      <p>
        <Link
          href={appealsProcessUrl}
          target="_blank"
          rel="noreferrer noopener"
          size={size}
          color="Standard"
          variant="Inline"
          underline="always"
          isExternal={false}
          onClick={() => {
            sendEvent(EventTypes.AppealsProcessClicked);
          }}
        >
          {translate("Action.ViewAppealGuidelines")}
        </Link>
      </p>
    </div>
  );
};

const AppealsProcessPageItemConfig: NAPageItemConfigType = {
  getIsVisible: punishmentData => punishmentData.showAppealsProcessLink,
  renderComponent: AppealsProcessPageItem,
  configName: "appeals-process",
};

export default AppealsProcessPageItemConfig;
