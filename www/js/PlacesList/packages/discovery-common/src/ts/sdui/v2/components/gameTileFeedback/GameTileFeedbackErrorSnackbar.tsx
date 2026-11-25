import React, { useEffect, useState } from "react";
import type { TranslateFunction } from "@rbx/core-scripts/react";
import { Snackbar } from "@rbx/foundation-ui";
import { subscribeToUserSignalErrors } from "./userSignalErrorEvents";
import {
  CommonUIFeatures,
  FeaturePlacesList,
} from "../../../../common/constants/translationConstants";

/**
 * The network error the non-SDUI game tile shows when a "Not interested" user
 * signal fails. Pages that compose `GameTileFeedbackSduiModule` mount it once.
 */
export function GameTileFeedbackErrorSnackbar({
  translate,
}: {
  translate: TranslateFunction;
}): React.JSX.Element | null {
  const [errorId, setErrorId] = useState(0);

  useEffect(
    () =>
      subscribeToUserSignalErrors(() => {
        setErrorId(previousId => previousId + 1);
      }),
    [],
  );

  if (errorId === 0) {
    return null;
  }

  return (
    <Snackbar
      key={errorId}
      title={translate(FeaturePlacesList.NetworkError)}
      icon="icon-regular-triangle-exclamation"
      closeIconAriaLabel={translate(CommonUIFeatures.ActionClose)}
      onClose={() => {
        setErrorId(0);
      }}
      shouldAutoDismiss
    />
  );
}
