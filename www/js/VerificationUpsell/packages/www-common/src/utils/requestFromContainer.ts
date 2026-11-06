// A container accepts a request by calling event.preventDefault(); an unhandled request resolves to the fallback instead of hanging.
export const requestFromContainer = <TResult>(
  eventName: string,
  buildDetail: (resolve: (result: TResult) => void) => unknown,
  fallback: TResult,
): Promise<TResult> =>
  new Promise(resolve => {
    const event = new CustomEvent(eventName, { cancelable: true, detail: buildDetail(resolve) });
    if (window.dispatchEvent(event)) {
      resolve(fallback);
    }
  });
