import { useCallback, useState } from 'react';
import { DeviceMeta } from 'Roblox';
import catalogConstants from '../constants/catalogConstants';
import { Library } from '../constants/types';

function useLibraryState() {
  const [library, setLibrary] = useState<Library>({
    initialized: false
  });

  const setupLibrary = useCallback(() => {
    setLibrary(prev => ({
      ...prev,
      isPhone: DeviceMeta ? DeviceMeta().isPhone : false,
      isDesktop: DeviceMeta ? DeviceMeta().isDesktop : true,
      isApp: DeviceMeta ? DeviceMeta().isInApp : false,
      catalogUrl: catalogConstants.catalogUrl,
      isFullScreen: DeviceMeta ? !DeviceMeta().isInApp : false,
      initialized: true
    }));
  }, []);

  return {
    library,
    setupLibrary
  };
}

export default useLibraryState;
