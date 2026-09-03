import React, { useState, useEffect } from "react";
import { Loading } from "@rbx/core-ui";
import bedev1Services from "../../common/services/bedev1Services";
import logSduiError, { SduiErrorNames } from "../utils/logSduiError";
import { TSduiContext } from "../system/SduiTypes";

type TSduiAssetImageProps = {
  assetId: string;
  sduiContext: TSduiContext;
};

/**
 * Given an assetId, fetches the asset CDN URL and displays the image
 *
 * Displays a Loading state while fetching the asset URL
 *
 * If the asset URL is not found, logs an error and displays a default image
 */
const SduiAssetImage = ({ assetId, sduiContext }: TSduiAssetImageProps): JSX.Element => {
  const [assetUrl, setAssetUrl] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    bedev1Services
      .getAssetDataFromAssetId(assetId)
      .then(res => {
        setAssetUrl(res?.locations[0]?.location ?? "");
      })
      .catch(() => {
        setAssetUrl("");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [assetId]);

  if (isLoading) {
    return <Loading />;
  }

  if (!assetUrl) {
    logSduiError(
      SduiErrorNames.AssetImageMissingAssetUrl,
      `AssetImage missing asset url for assetId ${assetId}`,
      sduiContext.pageContext,
    );

    // TODO https://roblox.atlassian.net/browse/CLIGROW-2200
    // Update default Hero Unit asset
    return <img src="" alt="asset" />;
  }

  return <img src={assetUrl} alt="asset" />;
};

export default SduiAssetImage;
