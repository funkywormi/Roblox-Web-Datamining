import React, { useEffect, useRef } from "react";
import { useGetParentInfoQuery } from "../../../apis/parentalControlsApi";
import useHandleParentLinking from "../../hooks/useHandleParentLinking";
import {
  shouldDisplayInitialModal,
  signalRedirectionCheckComplete,
} from "../../utils/hybridViewUtils";
import { redirectQueryParam, removeQueryParamFromUrl } from "../../utils/navigationUtils";

const AddParentRedirectHandler = (): JSX.Element => {
  // Guard so the upsell only fires once per mount, even if deps change
  // (e.g. useHandleParentLinking returns a new function reference each render).
  const hasHandledRef = useRef(false);
  const handleParentLinking = useHandleParentLinking();
  const { data: parentInfo, isLoading, isError } = useGetParentInfoQuery();

  useEffect(() => {
    if (hasHandledRef.current) {
      return;
    }

    const shouldCheckForAddParentRedirection = shouldDisplayInitialModal(
      redirectQueryParam.addParent,
    );
    if (!shouldCheckForAddParentRedirection) {
      return;
    }

    if (isLoading) {
      return;
    }

    hasHandledRef.current = true;

    if (!isError && parentInfo?.canAddParent) {
      handleParentLinking();
    }

    // Clear the param so a refresh doesn't re-trigger the upsell.
    removeQueryParamFromUrl(redirectQueryParam.addParent);
    signalRedirectionCheckComplete();
  }, [parentInfo, isLoading, isError, handleParentLinking]);

  return <React.Fragment />;
};

export default AddParentRedirectHandler;
