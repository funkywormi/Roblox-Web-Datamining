import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary } from "@rbx/core-scripts/react";
import { TranslationProviderSCC } from "@rbx/www-common/i18n/scc";
import { useTranslations } from "@rbx/www-common/i18n";
import type { Namespace } from "@rbx/www-common/i18n";
import { Thumbnail2d, ThumbnailTypes } from "@rbx/thumbnails";
import App from "./src/App";
import type { RenderThumbnail } from "./src/types";
import { formatDetailDate, formatListDate } from "./src/utils/messageUtils";
import { translations as rawTranslations } from "./component.json";
import "./src/main.css";

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- CI narrows Namespace; component.json is always valid
const translations = rawTranslations as unknown as readonly Namespace[];

const renderThumbnail: RenderThumbnail = ({ userId, altName }) => (
  <Thumbnail2d targetId={userId} type={ThumbnailTypes.avatarHeadshot} altName={altName} />
);

type TranslateFn = (key: string, params?: Record<string, string | number | Date>) => string;

const AppWithTranslate = (): React.ReactElement => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- erase CI-generated narrow key types
  const tMessages = useTranslations("Feature.Messages") as unknown as TranslateFn & {
    has: (key: string) => boolean;
  };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- erase CI-generated narrow key types
  const tBadges = useTranslations("Feature.ProfileBadges") as unknown as TranslateFn;
  const translate = (key: string, params?: Record<string, string | number | Date>): string =>
    tMessages.has(key) ? tMessages(key, params) : tBadges(key, params);
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
    <TranslationProviderSCC namespaces={translations}>
      <AppWithTranslate />
    </TranslationProviderSCC>,
    container,
  );
});
