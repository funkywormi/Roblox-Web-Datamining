import { useState, useEffect } from 'react';

// This is a hook to check if the login page was a return url from a link sent to parents
const useCheckParentUrl = () => {
  const [hasParentParam, setHasParentParam] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const returnUrl = String(searchParams.get('returnUrl'));
    setHasParentParam(returnUrl.includes('parental-requests'));
  }, []);

  return hasParentParam;
};

export default useCheckParentUrl;
