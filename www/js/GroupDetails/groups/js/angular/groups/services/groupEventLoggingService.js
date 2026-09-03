import groupsModule from '../groupsModule';
import {
  logGroupPageExposureEvent,
  logGroupPageClickEvent,
  logCmntyEntrypointExposureEvent,
  logCmntyEntrypointClickEvent,
  logCmntySearchConductedEvent,
  logCmntySearchResultsReturnedEvent,
  getCommunitySessionEnterFrom
} from '../../../../ts/react/shared/utils/logging';
import {
  mintEntrypointImpressionId,
  mintSearchId
} from '../../../../ts/react/shared/utils/entrypointMetrics';

function groupEventLoggingService(eventConstants) {
  'ngInject';

  return {
    logGroupPageExposureEvent,
    logGroupPageClickEvent,
    // Community entry-point / search instrumentation (GRPS-3060).
    logCmntyEntrypointExposureEvent,
    logCmntyEntrypointClickEvent,
    logCmntySearchConductedEvent,
    logCmntySearchResultsReturnedEvent,
    mintEntrypointImpressionId,
    mintSearchId,
    // GRPS-3102: community session enter_from for the Join click.
    getCommunitySessionEnterFrom
  };
}

groupsModule.factory('groupEventLoggingService', groupEventLoggingService);

export default groupEventLoggingService;
