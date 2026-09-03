import { Icon } from "@rbx/foundation-ui";
import {
  useNotApprovedTranslate,
  useNotApprovedUIConfig,
} from "../../providers/NotApprovedUIProvider";
import { PUNISHMENT_TYPE, PUNISHMENT_TYPE_TO_STRING_KEY } from "../../utils/constants";
import { TPunishment } from "../../utils/types";
import { usePageNavigation } from "../../context/PageNavigationContext";
import HeaderPopoverMenu from "./HeaderPopoverMenu";
import HeaderProgressBar from "./HeaderProgressBar";
import BackButton from "./BackButton";

type Props = {
  punishmentData: TPunishment;
};

/**
 * Determines which header to display based on the page of the Not Approved Page.
 * On the first page, the header displays the intervention type as well as a popover holding the
 * logout button.
 *
 * On subsequent pages, the header displays a back button.
 *
 * In read-only mode, the logout popover menu is hidden; the dialog's own close affordance
 * (Foundation `hasCloseAffordance`) provides the dismiss control.
 *
 * This component now uses the PageNavigationContext to access page state and navigation,
 * eliminating prop drilling.
 */
const NotApprovedDialogHeader = ({ punishmentData }: Props): JSX.Element => {
  const { isFirstPage, totalPages } = usePageNavigation();
  const { readOnly } = useNotApprovedUIConfig();
  const translate = useNotApprovedTranslate();

  const { punishmentTypeDescription, verificationCategory } = punishmentData;
  const punishmentTypeLabel = verificationCategory
    ? translate("Heading.Suspended")
    : translate(PUNISHMENT_TYPE_TO_STRING_KEY[punishmentTypeDescription] ?? "") ||
      translate("Heading.Suspended");

  const iconColor =
    punishmentTypeDescription === PUNISHMENT_TYPE.Warn && !verificationCategory
      ? "content-system-warning"
      : "content-system-alert";

  const iconName =
    punishmentTypeDescription === PUNISHMENT_TYPE.Delete
      ? "icon-regular-circle-slash"
      : "icon-regular-triangle-exclamation";

  if (isFirstPage) {
    return (
      <div data-testid="not-approved-dialog-header">
        <div className="flex justify-between items-center gap-medium">
          <div className="flex gap-small items-center padding-y-medium">
            <Icon name={iconName} size="Large" className={iconColor} />
            <span className="text-heading-small">{punishmentTypeLabel}</span>
          </div>
          {!readOnly && <HeaderPopoverMenu />}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="not-approved-dialog-header">
      <div className="flex flex-col gap-large items-start">
        <BackButton />
        {totalPages > 2 && <HeaderProgressBar />}
      </div>
    </div>
  );
};

export default NotApprovedDialogHeader;
