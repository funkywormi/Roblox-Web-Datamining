import { useEffect, useRef } from "react";
import { reportNotificationStreamError } from "./notificationStreamObservability";

// react-query 5 drops useQuery's onError, and the stream runs on 4 (.NET) and 5 (Next).
export const useReportQueryError = (
  scope: string,
  error: unknown,
  errorUpdatedAt: number,
): void => {
  const reportedAt = useRef(errorUpdatedAt);
  useEffect(() => {
    if (errorUpdatedAt === reportedAt.current) {
      return;
    }
    reportedAt.current = errorUpdatedAt;
    if (error != null) {
      reportNotificationStreamError(scope, error);
    }
  }, [scope, error, errorUpdatedAt]);
};

export default useReportQueryError;
