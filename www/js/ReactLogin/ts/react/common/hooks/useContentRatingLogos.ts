import { useState, useEffect } from 'react';
import { getContentRatingLogoPolicy } from '../../reactLanding/services/landingService';

type ContentRatingLogos = {
  shouldDisplayBrazilRatingLogo: boolean;
  shouldDisplayItalyRatingLogo: boolean;
};

function useContentRatingLogos(): ContentRatingLogos {
  const [shouldDisplayBrazilRatingLogo, setShouldDisplayBrazilRatingLogo] = useState(false);
  const [shouldDisplayItalyRatingLogo, setShouldDisplayItalyRatingLogo] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const contentRatingLogoPolicy = await getContentRatingLogoPolicy();
      if (contentRatingLogoPolicy) {
        setShouldDisplayBrazilRatingLogo(contentRatingLogoPolicy.displayBrazilRatingLogo);
        setShouldDisplayItalyRatingLogo(contentRatingLogoPolicy.displayItalyRatingLogo);
      }
    }
    // eslint-disable-next-line no-void
    void fetchData();
  }, []);

  return { shouldDisplayBrazilRatingLogo, shouldDisplayItalyRatingLogo };
}

export default useContentRatingLogos;
