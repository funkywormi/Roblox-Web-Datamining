/**
 * Redirects to the login page with a return URL that brings the user back to the specified profile
 * @param profileId - The ID of the profile to return to after login
 */
export const redirectToSignupWithProfileReturn = (profileId: string): void => {
  const profileUrl = `${window.location.origin}/users/${profileId}/profile`;
  const encodedReturnUrl = encodeURIComponent(profileUrl);
  window.location.href = `/account/signupredir?returnUrl=${encodedReturnUrl}`;
};

/**
 * Redirects to the login page with a return URL that brings the user back to the specified profile
 * @param profileId - The ID of the profile to return to after login
 */
export const redirectToLoginWithProfileReturn = (profileId: string): void => {
  const profileUrl = `${window.location.origin}/users/${profileId}/profile`;
  const encodedReturnUrl = encodeURIComponent(profileUrl);
  window.location.href = `/login?returnUrl=${encodedReturnUrl}`;
};

/**
 * Refreshes profile data with Fibonacci backoff retry logic to handle backend latency
 * @param refreshFn - The function to call to refresh the profile platform
 * @param expectedName - The new name we expect to see after the refresh
 * @param maxTotalTimeMs - Maximum total time to retry (default 3000ms)
 * @returns Promise<boolean> - Returns true if name was updated successfully, false if timeout
 */
export const refreshProfileWithRetry = async (
  refreshFn: () => Promise<void>,
  expectedName: string,
  maxTotalTimeMs = 3000,
): Promise<boolean> => {
  /**
   * Generates Fibonacci sequence delays that sum to at most maxTime
   * Sequence: 100ms, 100ms, 200ms, 300ms, 500ms, 800ms, 1300ms...
   */
  const getFibonacciDelays = (maxTime: number): number[] => {
    const delays: number[] = [];
    let a = 100; // First Fibonacci number * 100ms
    let b = 100; // Second Fibonacci number * 100ms
    let total = 0;

    while (total + a <= maxTime) {
      delays.push(a);
      total += a;
      const next = a + b;
      a = b;
      b = next;
    }

    return delays;
  };

  /**
   * Checks if the name in the DOM has been updated to the expected value
   */
  const checkNameUpdated = (): boolean => {
    const nameElement = document.getElementById("profile-header-title-container-name");
    if (!nameElement?.textContent) return false;
    const currentName = nameElement.textContent.trim();
    return currentName === expectedName;
  };

  // Initial refresh attempt
  await refreshFn();

  // Check if already updated
  if (checkNameUpdated()) {
    return true;
  }

  // Retry with Fibonacci backoff
  const delays = getFibonacciDelays(maxTotalTimeMs);

  for (const delay of delays) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise(resolve => {
      setTimeout(resolve, delay);
    });
    // eslint-disable-next-line no-await-in-loop
    await refreshFn();

    if (checkNameUpdated()) {
      return true;
    }
  }

  // Final check after all retries
  const finalResult = checkNameUpdated();

  if (!finalResult) {
    window.location.reload();
  }

  return finalResult;
};
