import { useState, useEffect } from "react";
import { embedProdLink, emebedStagingLink } from "../core/constants/sierra";
import { isProd } from "../core/helpers/supportEnvironment";

const useSierraSdkLoader = (): boolean => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.onload = () => {
      setIsLoading(false);
    };
    script.src = isProd ? embedProdLink : emebedStagingLink;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return !isLoading;
};

export default useSierraSdkLoader;
