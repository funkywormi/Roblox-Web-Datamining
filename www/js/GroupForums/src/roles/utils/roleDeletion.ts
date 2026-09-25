const DEFAULT_MAX_ATTEMPTS = 30;
const DEFAULT_POLL_INTERVAL_MS = 2_000;
const REQUEST_TIMEOUT_STATUS = 408;
const BAD_GATEWAY_STATUS = 502;
const GATEWAY_TIMEOUT_STATUS = 504;

type RoleIdentifier = {
  id?: number;
};

type WaitForRoleDeletionOptions = {
  roleId: number;
  getRoles: () => Promise<readonly RoleIdentifier[] | undefined>;
  maxAttempts?: number;
  pollIntervalMs?: number;
};

type DeleteRoleAndWaitForCompletionOptions = WaitForRoleDeletionOptions & {
  deleteRole: () => Promise<void>;
};

const delay = (duration: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, duration);
  });

const getResponseStatus = (error: unknown): number | undefined => {
  if (
    typeof error !== 'object' ||
    error === null ||
    !('response' in error) ||
    typeof error.response !== 'object' ||
    error.response === null ||
    !('status' in error.response) ||
    typeof error.response.status !== 'number'
  ) {
    return undefined;
  }

  return error.response.status;
};

// A long-running delete can fail at the network layer (connection reset / abort)
// before any HTTP status comes back; the client surfaces this as a FetchError with
// no `response`. Treat it as pending so we still poll to see if the delete completed.
const isFetchError = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && 'name' in error && error.name === 'FetchError';

export const isRoleDeletionPendingError = (error: unknown): boolean => {
  const status = getResponseStatus(error);
  return (
    status === REQUEST_TIMEOUT_STATUS ||
    status === BAD_GATEWAY_STATUS ||
    status === GATEWAY_TIMEOUT_STATUS ||
    isFetchError(error)
  );
};

export const waitForRoleDeletion = async ({
  roleId,
  getRoles,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
  pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
}: WaitForRoleDeletionOptions): Promise<boolean> => {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (attempt > 0) {
      await delay(pollIntervalMs);
    }

    const roles = await getRoles().catch(() => undefined);
    if (roles && !roles.some((role) => role.id === roleId)) {
      return true;
    }
  }

  return false;
};

export const deleteRoleAndWaitForCompletion = async ({
  deleteRole,
  ...waitOptions
}: DeleteRoleAndWaitForCompletionOptions): Promise<boolean> => {
  try {
    await deleteRole();
    return true;
  } catch (error) {
    if (!isRoleDeletionPendingError(error)) {
      return false;
    }
  }

  return waitForRoleDeletion(waitOptions);
};
