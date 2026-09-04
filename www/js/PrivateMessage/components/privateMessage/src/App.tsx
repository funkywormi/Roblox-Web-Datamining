import { ProgressCircle } from "@rbx/foundation-ui";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { MESSAGE_MODULE_STATE, MESSAGE_TABS } from "./constants";
import type { FormatDate, RenderThumbnail, Translate } from "./types";
import { usePrivateMessages } from "./hooks/usePrivateMessages";
import FeedbackSnackbar from "./components/FeedbackSnackbar";
import MessageActions from "./components/MessageActions";
import MessageDetail from "./components/MessageDetail";
import MessageList from "./components/MessageList";
import NewsList from "./components/NewsList";
import TabsHeader from "./components/TabsHeader";

export type AppProps = {
  // Injected by the entry and passed as props (not React context) so the dual-React mount can't mismatch.
  translate: Translate;
  renderThumbnail: RenderThumbnail;
  formatListDate: FormatDate;
  formatDetailDate: FormatDate;
};

const App = ({
  translate,
  renderThumbnail,
  formatListDate,
  formatDetailDate,
}: AppProps): React.ReactElement => {
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
        translate={translate}
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
          <NewsList
            translate={translate}
            renderThumbnail={renderThumbnail}
            formatListDate={formatListDate}
            page={messages.page}
          />
        ) : (
          <MessageList
            translate={translate}
            renderThumbnail={renderThumbnail}
            formatListDate={formatListDate}
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
          translate={translate}
          renderThumbnail={renderThumbnail}
          formatDetailDate={formatDetailDate}
          message={messages.selectedMessage}
          activeTab={messages.route.tab}
        />
      ) : null}
      <FeedbackSnackbar feedback={messages.feedback} onClose={messages.dismissFeedback} />
    </main>
  );
};

export default App;
