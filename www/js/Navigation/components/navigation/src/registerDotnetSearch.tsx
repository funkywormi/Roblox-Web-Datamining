import * as http from "@rbx/core-scripts/http";
import Intl from "@rbx/core-scripts/intl";
import { SearchLandingService } from "@rbx/core-scripts/legacy/Roblox";
import { PageNameProvider } from "@rbx/core-scripts/util/page-name";
import {
  Thumbnail2d,
  ThumbnailTypes,
  DefaultThumbnailSize,
  ThumbnailFormat,
} from "@rbx/thumbnails";
import { getAvatarRequestSuggestion, getSearchSuggestion } from "./services/searchService";
import { registerNavCapabilities } from "./util/navCapabilities";
import {
  getIsTopSearchResultsEnabled,
  logTopSearchResultsExposureOnce,
} from "./util/topSearchResultsIxp";

const GameIconThumbnail = ({ universeId, onLoad }: { universeId: number; onLoad: () => void }) => (
  <Thumbnail2d
    type={ThumbnailTypes.gameIcon}
    size={DefaultThumbnailSize}
    targetId={universeId}
    containerClass="thumbnail-icon"
    format={ThumbnailFormat.jpeg}
    onLoad={onLoad}
  />
);

registerNavCapabilities({
  getGamesAutocompleteSuggestions: getSearchSuggestion,
  getAvatarAutocompleteSuggestions: getAvatarRequestSuggestion,
  isSearchRequestCancelled: http.isCancelled,
  searchLanding: {
    mount: () => {
      SearchLandingService.mountSearchLanding();
    },
    show: sessionInfo => {
      SearchLandingService.showSearchLanding(sessionInfo);
    },
    updateSessionInfo: sessionInfo => {
      SearchLandingService.updateSessionInfo(sessionInfo);
    },
  },
  getInternalPageName: () => PageNameProvider.getInternalPageName(),
  getLocale: () => new Intl().getLocale(),
  GameIconThumbnail,
  isTopSearchResultsEnabled: getIsTopSearchResultsEnabled,
  logTopSearchResultsExposureOnce,
});
