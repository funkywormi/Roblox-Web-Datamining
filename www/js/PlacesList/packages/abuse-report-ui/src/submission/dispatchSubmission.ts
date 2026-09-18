import type {
  ClientActionName,
  ResolvedConfig,
  SubmissionTarget,
} from "@rbx/abuse-report-config-types";
import submitReport from "../api/submitReport";

export type SubmissionData = ResolvedConfig["submission"]["data"];

type SubmissionResult = {
  reportId?: string;
};

export type ClientActionHandler = (context: {
  name: ClientActionName;
  data: SubmissionData;
}) => Promise<SubmissionResult>;

export type ClientActionRegistry = Partial<Record<ClientActionName, ClientActionHandler>>;

export type SubmissionTargetFailureReason =
  | "missing-client-action-handler"
  | "unsupported-submission-target";

export class SubmissionTargetDispatchError extends Error {
  public constructor(
    public readonly reason: SubmissionTargetFailureReason,
    message: string,
  ) {
    super(message);
    this.name = "SubmissionTargetDispatchError";
  }
}

type DispatchSubmissionOptions = {
  target: SubmissionTarget;
  data: SubmissionData;
  clientActions?: ClientActionRegistry;
};

const rejectUnsupportedTarget = (target: never): Promise<never> =>
  Promise.reject(
    new SubmissionTargetDispatchError(
      "unsupported-submission-target",
      `Unsupported submission target: ${JSON.stringify(target)}`,
    ),
  );

export const dispatchSubmission = ({
  target,
  data,
  clientActions,
}: DispatchSubmissionOptions): Promise<SubmissionResult> => {
  switch (target.type) {
    case "default":
      return submitReport(data);
    case "clientAction": {
      const handler = clientActions?.[target.name];
      if (!handler) {
        return Promise.reject(
          new SubmissionTargetDispatchError(
            "missing-client-action-handler",
            `No handler is registered for client action "${target.name}"`,
          ),
        );
      }

      return handler({ name: target.name, data });
    }
    default:
      return rejectUnsupportedTarget(target);
  }
};
