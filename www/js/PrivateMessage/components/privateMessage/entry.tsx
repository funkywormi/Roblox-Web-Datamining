import ready from "@rbx/core-scripts/util/ready";
import {
  renderWithErrorBoundary,
  TranslationProvider,
  useTranslation,
} from "@rbx/core-scripts/react";
import { Thumbnail2d, ThumbnailTypes } from "@rbx/thumbnails";
import App from "./src/App";
import type { RenderThumbnail } from "./src/types";
import { formatDetailDate, formatListDate } from "./src/utils/messageUtils";
import { translations } from "./component.json";
import "./src/main.css";

// SCC entry: source the translate + thumbnail renderer from the legacy stack and hand them to App
// (which is agnostic to their source). The Next entry supplies them from next-intl / www-common.
const renderThumbnail: RenderThumbnail = ({ userId, altName }) => (
  <Thumbnail2d targetId={userId} type={ThumbnailTypes.avatarHeadshot} altName={altName} />
);

const AppWithCoreScriptsTranslate = (): React.ReactElement => {
  const { translate } = useTranslation();
  return (
    <App
      translate={translate}
      renderThumbnail={renderThumbnail}
      formatListDate={formatListDate}
      formatDetailDate={formatDetailDate}
    />
  );
};

const getContainer = (): HTMLElement | null =>
  document.getElementById("private-message") ?? document.getElementById("private-message-web-app");

ready(() => {
  const container = getContainer();
  if (!container) {
    return;
  }

  if (container.id === "private-message-web-app") {
    container.classList.add("messages-container");
  }

  renderWithErrorBoundary(
    <TranslationProvider config={translations}>
      <AppWithCoreScriptsTranslate />
    </TranslationProvider>,
    container,
  );
});
