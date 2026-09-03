export const wrapEventServiceWithTryCatch = <T extends (...args: any[]) => void>(fn: T): T => {
  return ((...args: Parameters<T>) => {
    try {
      fn(...args);
    } catch (error) {
      // Ignore failures as event sending is non-critical
    }
  }) as T;
};

export default wrapEventServiceWithTryCatch;
