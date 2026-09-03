import React from "react";
import useSierraSdkLoader from "../../hooks/useSierraSdkLoader";

const SierraSDKLoader: React.FC<{ onLoad: () => void }> = ({ onLoad }) => {
  const isSdkScriptLoaded = useSierraSdkLoader();

  React.useEffect(() => {
    if (isSdkScriptLoaded) {
      onLoad();
    }
  }, [isSdkScriptLoaded, onLoad]);

  return null;
};

export default SierraSDKLoader;
