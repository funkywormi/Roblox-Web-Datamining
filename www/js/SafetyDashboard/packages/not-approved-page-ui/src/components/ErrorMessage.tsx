import { Icon } from "@rbx/foundation-ui";
import {
  useNotApprovedTranslate,
  useNotApprovedUIConfig,
} from "../providers/NotApprovedUIProvider";
import HeaderPopoverMenu from "./header/HeaderPopoverMenu";

/**
 * Header slot for the error state. In standard mode it renders the logout popover so the user can
 * still log out without dismissing the dialog.
 *
 * In read-only mode the logout popover is hidden
 * since the dialog would have the close affordance to dismiss it.
 */
export const ErrorMessageHeader = () => {
  const { readOnly } = useNotApprovedUIConfig();
  return readOnly ? null : (
    <div className="shrink-0 flex justify-end items-center">
      <HeaderPopoverMenu />
    </div>
  );
};

/**
 * Body slot for the error state: the alert icon and generic error heading, centered to fill the
 * host body wrapper.
 */
export const ErrorMessageBody = ({ error }: { error: unknown }) => {
  const translate = useNotApprovedTranslate();

  // TODO: @dmoon track error in Sentry
  if (error) {
    console.error(error);
  }

  return (
    <div className="flex flex-col height-full min-height-0">
      <div className="grow-1 flex flex-col items-center justify-center gap-medium padding-xxlarge radius-medium bg-surface-100 width-full min-height-[225px]">
        <Icon name="icon-regular-triangle-exclamation" size="XLarge" />
        <span className="text-body-large content-emphasis margin-none">
          {translate("Heading.Error")}
        </span>
      </div>
    </div>
  );
};
