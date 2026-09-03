const validationNamespace = "validation";
const eventNamespace = "eventTracker";

const handleErrors = (e: unknown): void => {
  // JSON.parse failed and string might be corrupted
  if (e instanceof SyntaxError) {
    window.sessionStorage.removeItem(eventNamespace);
  }
};

export const isAvailable = (): boolean => {
  try {
    window.sessionStorage.setItem(validationNamespace, validationNamespace);
    window.sessionStorage.removeItem(validationNamespace);
    return true;
  } catch (e) {
    return false;
  }
};

export const setPerTabEventProperties = (eventProperties: Record<string, any>): boolean => {
  try {
    const storageContents = JSON.parse(
      window.sessionStorage.getItem(eventNamespace) || "{}",
    ) as Record<string, any>;
    const updatedStorage = {
      ...storageContents,
      ...eventProperties,
    };
    window.sessionStorage.setItem(eventNamespace, JSON.stringify(updatedStorage));
    return true;
  } catch (e) {
    handleErrors(e);
    return false;
  }
};

export const getPerTabEventProperties = <T extends Array<string>>(
  eventProperties: T,
): Record<T[number], any> => {
  try {
    const storageContents = JSON.parse(
      window.sessionStorage.getItem(eventNamespace) || "{}",
    ) as Record<string, any>;
    const retrievedStorage = eventProperties.reduce<Record<string, any>>((acc, item) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      acc[item] = storageContents[item];
      return acc;
    }, {});
    return retrievedStorage;
  } catch (e) {
    handleErrors(e);
    return {} as Record<T[number], any>;
  }
};

export default {
  isAvailable,
  setPerTabEventProperties,
  getPerTabEventProperties,
};
