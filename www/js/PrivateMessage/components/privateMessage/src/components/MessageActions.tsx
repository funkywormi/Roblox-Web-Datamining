import { Button, Checkbox } from "@rbx/foundation-ui";
import { MESSAGE_MODULE_STATE, MESSAGE_TABS } from "../constants";
import type { MessageModuleState, MessageTab, Translate } from "../types";
import ClickBoundary from "./ClickBoundary";
import PaginationControls from "./PaginationControls";

const MessageActions = ({
  translate,
  activeTab,
  moduleState,
  selectedCount,
  totalCount,
  currentPage,
  totalPages,
  onToggleSelectAll,
  onMarkArchive,
  onMarkRead,
  onBack,
  onChangePage,
}: {
  translate: Translate;
  activeTab: MessageTab;
  moduleState: MessageModuleState;
  selectedCount: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onToggleSelectAll: () => void;
  onMarkArchive: (archive: boolean) => void;
  onMarkRead: (markRead: boolean) => void;
  onBack: () => void;
  onChangePage: (page: number) => void;
}): React.ReactElement | null => {
  const isInbox = activeTab === MESSAGE_TABS.inbox;
  const isArchive = activeTab === MESSAGE_TABS.archive;

  if (activeTab === MESSAGE_TABS.sent || activeTab === MESSAGE_TABS.notifications) {
    return moduleState === MESSAGE_MODULE_STATE.list ? (
      <div className="flex justify-end margin-y-medium">
        <PaginationControls
          translate={translate}
          currentPage={currentPage}
          totalPages={totalPages}
          onChangePage={onChangePage}
        />
      </div>
    ) : (
      <div className="margin-y-medium">
        <Button variant="Standard" size="Medium" onClick={onBack}>
          {translate("Action.Back")}
        </Button>
      </div>
    );
  }

  if (moduleState === MESSAGE_MODULE_STATE.detail) {
    return (
      <div className="flex items-center gap-small margin-y-medium">
        <Button variant="Standard" size="Medium" onClick={onBack}>
          {translate("Action.Back")}
        </Button>
        {isInbox ? (
          <Button
            variant="Standard"
            size="Medium"
            onClick={() => {
              onMarkArchive(true);
            }}
          >
            {translate("Action.Archive")}
          </Button>
        ) : null}
        {isArchive ? (
          <Button
            variant="Standard"
            size="Medium"
            onClick={() => {
              onMarkArchive(false);
            }}
          >
            {translate("Action.MoveToInbox")}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-medium margin-y-medium wrap">
      <div className="flex items-center gap-small wrap">
        <ClickBoundary className="padding-left-large">
          <Checkbox
            label={translate("Label.All")}
            size="Medium"
            placement="Start"
            isChecked={totalCount > 0 && selectedCount === totalCount}
            onCheckedChange={onToggleSelectAll}
          />
        </ClickBoundary>
        <div className="private-message-action-buttons flex items-center gap-small wrap">
          {isInbox ? (
            <Button
              variant="Standard"
              size="Medium"
              onClick={() => {
                onMarkArchive(true);
              }}
            >
              {translate("Action.Archive")}
            </Button>
          ) : null}
          {isArchive ? (
            <Button
              variant="Standard"
              size="Medium"
              onClick={() => {
                onMarkArchive(false);
              }}
            >
              {translate("Action.MoveToInbox")}
            </Button>
          ) : null}
          <Button
            variant="Standard"
            size="Medium"
            onClick={() => {
              onMarkRead(true);
            }}
          >
            {translate("Action.MarkAsRead")}
          </Button>
          <Button
            variant="Standard"
            size="Medium"
            onClick={() => {
              onMarkRead(false);
            }}
          >
            {translate("Action.MarkAsUnread")}
          </Button>
        </div>
      </div>
      <PaginationControls
        translate={translate}
        currentPage={currentPage}
        totalPages={totalPages}
        onChangePage={onChangePage}
      />
    </div>
  );
};

export default MessageActions;
