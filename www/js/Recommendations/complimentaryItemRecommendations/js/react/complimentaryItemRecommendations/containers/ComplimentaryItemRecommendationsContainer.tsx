import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createSystemFeedback } from 'react-style-guide';
import ComplimentaryItemRecommendationsCarousel from '../components/ComplimentaryItemRecommendationsCarousel';

type TComplimentaryItemRecommendationsContainerProps = {
  itemId: number;
  isBundle: boolean;
  displayPurchaseButtonLeft: boolean;
};

export const ComplimentaryItemRecommendationsContainer = ({
  itemId,
  isBundle,
  displayPurchaseButtonLeft
}: TComplimentaryItemRecommendationsContainerProps): JSX.Element | null => {
  const [SystemFeedback, systemFeedbackService] = createSystemFeedback();
  return (
    <React.Fragment>
      <ComplimentaryItemRecommendationsCarousel
        itemId={itemId}
        isBundle={isBundle}
        displayPurchaseButtonLeft={displayPurchaseButtonLeft}
        systemFeedbackService={systemFeedbackService}
      />
      <SystemFeedback />
    </React.Fragment>
  );
};

export default ComplimentaryItemRecommendationsContainer;
