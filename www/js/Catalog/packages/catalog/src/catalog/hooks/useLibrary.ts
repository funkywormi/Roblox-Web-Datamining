import { useCallback, useState } from "react";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import catalogConstants from "../constants/catalogConstants";
import { Library } from "../constants/types";

function useLibraryState() {
  const [library, setLibrary] = useState<Library>({
    initialized: false,
  });

  const setupLibrary = useCallback(() => {
    setLibrary(prev => ({
      ...prev,
      isPhone: getDeviceMeta()?.isPhone ?? false,
      isDesktop: getDeviceMeta()?.isDesktop ?? true,
      isApp: getDeviceMeta()?.isInApp ?? false,
      catalogUrl: catalogConstants.catalogUrl,
      isFullScreen: getDeviceMeta() ? !getDeviceMeta()?.isInApp : false,
      initialized: true,
    }));
  }, []);

  return {
    library,
    setupLibrary,
  };
}

export default useLibraryState;
