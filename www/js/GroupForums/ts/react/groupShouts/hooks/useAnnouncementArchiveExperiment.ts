import { useEffect, useState } from 'react';
import { CurrentUser, ExperimentationService } from 'Roblox';
import { layers } from '../../shared/constants/experimentConstants';

const ANNOUNCEMENT_ARCHIVE_EXPERIMENT_PARAM = 'isAnnouncementArchiveEnabled';

/** Reads the announcement archive layer when the product feature is enabled. */
function useAnnouncementArchiveExperiment(enabled: boolean): boolean | undefined {
  const [isAnnouncementArchiveEnabled, setIsAnnouncementArchiveEnabled] = useState<boolean>();

  useEffect(() => {
    if (!enabled || !CurrentUser.isAuthenticated) {
      return;
    }

    ExperimentationService.getAllValuesForLayer(layers.announcementArchive)
      .then(response => {
        setIsAnnouncementArchiveEnabled(response?.[ANNOUNCEMENT_ARCHIVE_EXPERIMENT_PARAM] === true);
      })
      .catch(() => {
        setIsAnnouncementArchiveEnabled(false);
      });
  }, [enabled]);

  return enabled && CurrentUser.isAuthenticated ? isAnnouncementArchiveEnabled : false;
}

export default useAnnouncementArchiveExperiment;
