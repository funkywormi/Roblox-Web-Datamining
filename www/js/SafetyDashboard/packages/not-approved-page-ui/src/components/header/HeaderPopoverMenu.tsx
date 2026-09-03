import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Popover,
  Menu,
  MenuItem,
  PopoverContent,
  PopoverTrigger,
  ProgressCircle,
  IconButton,
} from "@rbx/foundation-ui";
import { EventTypes } from "../../telemetry/analytics";
import {
  useNotApprovedTranslate,
  useNotApprovedUIConfig,
} from "../../providers/NotApprovedUIProvider";
import useSendNotApprovedPageEvent from "../../telemetry/useSendNotApprovedPageEvent";

/**
 * A popover menu that appears when the user clicks on the icon button.
 * The menu currently only contains the logout button and is displayed on the first page in the header
 * of the Not Approved Page.
 */
const HeaderPopoverMenu = (): JSX.Element => {
  const translate = useNotApprovedTranslate();
  const { onLogout } = useNotApprovedUIConfig();
  const sendEvent = useSendNotApprovedPageEvent();

  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await onLogout();
    },
    onMutate: () => {
      setIsLogoutLoading(true);
      sendEvent(EventTypes.LogoutClicked);
    },
    onError: (error: unknown) => {
      // TODO: Track this error with Sentry
      const message = error instanceof Error ? error.message : "Unknown error";
      sendEvent(EventTypes.Error, {
        additionalInfo: `headerPopoverLogout: Error logging out - ${message}`,
      });
      setIsLogoutLoading(false);
    },
    retry: 0, // pin to prevent double-firing onMutate if QueryClient defaults change
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <IconButton
          icon="icon-filled-three-dots-vertical"
          ariaLabel={translate("Label.OpenMenu")}
          variant="Utility"
          size="Medium"
        />
      </PopoverTrigger>

      <PopoverContent side="bottom" align="end" ariaLabel={translate("Label.MenuContent")}>
        <Menu size="Medium">
          <MenuItem
            value="one"
            title={translate("Action.LogOut")}
            onSelect={() => {
              logoutMutation.mutate();
            }}
            disabled={isLogoutLoading}
            trailing={
              isLogoutLoading ? (
                <ProgressCircle
                  size="Small"
                  ariaLabel={translate("Label.LogoutProgress")}
                  variant="Indeterminate"
                />
              ) : undefined
            }
          />
        </Menu>
      </PopoverContent>
    </Popover>
  );
};

export default HeaderPopoverMenu;
