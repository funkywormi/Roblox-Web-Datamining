import { ProgressCircle } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { MESSAGE_MODULE_STATE, MESSAGE_TABS } from "./constants";
import { usePrivateMessages } from "./hooks/usePrivateMessages";
import FeedbackSnackbar from "./components/FeedbackSnackbar";
import MessageActions from "./components/MessageActions";
import MessageDetail from "./components/MessageDetail";
import MessageList from "./components/MessageList";
import NewsList from "./components/NewsList";
import TabsHeader from "./components/TabsHeader";

const App = (): React.ReactElement => {
  const { translate } = useTranslation();
  const messages = usePrivateMessages({ translate });
  const isInApp = getDeviceMeta()?.isInApp === true;
  const currentPage = messages.page ? messages.page.pageNumber + 1 : messages.route.page;
  const totalPages = messages.page?.totalPages ?? 1;
  const totalMessages = messages.page?.collection.length ?? 0;

  return (
    <main className="private-message-page margin-x-auto padding-medium">
      {!isInApp ? (
        <h1 className="text-heading-large content-emphasis margin-top-none margin-bottom-medium">
          {translate("Heading.Message")}
        </h1>
      ) : null}
      <TabsHeader
        activeTab={messages.route.tab}
        tabs={messages.tabs}
        onSelectTab={messages.openTab}
      />
      <MessageActions
        activeTab={messages.route.tab}
        moduleState={messages.moduleState}
        selectedCount={messages.selectedMessageIds.size}
        totalCount={totalMessages}
        currentPage={currentPage}
        totalPages={totalPages}
        onToggleSelectAll={messages.toggleSelectAll}
        onMarkArchive={archive => {
          // eslint-disable-next-line no-void
          void messages.markArchive(archive);
        }}
        onMarkRead={markRead => {
          // eslint-disable-next-line no-void
          void messages.markRead(markRead);
        }}
        onBack={messages.backToList}
        onChangePage={messages.changePage}
      />
      {messages.loading ? (
        <div className="flex justify-center padding-xxlarge">
          <ProgressCircle
            ariaLabel={translate("Label.Loading")}
            variant="Indeterminate"
            size="Medium"
          />
        </div>
      ) : null}
      {!messages.loading && messages.error ? (
        <div className="bg-surface-100 stroke-standard stroke-muted radius-medium padding-large text-body-large content-system-alert">
          {messages.error}
        </div>
      ) : null}
      {!messages.loading &&
      !messages.error &&
      messages.moduleState === MESSAGE_MODULE_STATE.list ? (
        messages.route.tab === MESSAGE_TABS.notifications ? (
          <NewsList page={messages.page} />
        ) : (
          <MessageList
            page={messages.page}
            activeTab={messages.route.tab}
            selectedMessageIds={messages.selectedMessageIds}
            onToggleSelection={messages.toggleMessageSelection}
            onOpenMessage={(message, index) => {
              // eslint-disable-next-line no-void
              void messages.openMessage(message, index);
            }}
          />
        )
      ) : null}
      {!messages.loading &&
      !messages.error &&
      messages.moduleState === MESSAGE_MODULE_STATE.detail ? (
        <MessageDetail
          message={messages.selectedMessage}
          activeTab={messages.route.tab}
          sendReplyState={messages.sendReplyState}
          onReplyContentChange={messages.updateReplyContent}
          onIncludePreviousMessageChange={messages.updateIncludePreviousMessage}
          onSendReply={() => {
            // eslint-disable-next-line no-void
            void messages.sendReply();
          }}
        />
      ) : null}
      <FeedbackSnackbar feedback={messages.feedback} onClose={messages.dismissFeedback} />
    </main>
  );
};

export default App;
