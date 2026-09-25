import { httpService } from 'core-utilities';
import { EnvironmentUrls } from 'Roblox';

const INITIAL_POLL_INTERVAL_MS = 1000;
const MAX_POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 10;

const ASSET_UPLOAD_API_BASE = `${EnvironmentUrls.apiGatewayUrl}/assets/user-auth/v1`;
const ASSET_UPLOAD_URL = `${ASSET_UPLOAD_API_BASE}/assets`;
const OPEN_USE_ADDITIONAL_PARAMETERS = JSON.stringify({ AssetPrivacy: 'OpenUse' });

export interface AssetUploadCreationContext {
  creator: {
    userId?: string;
    groupId?: string;
  };
}

export interface AssetUploadRequestPayload {
  assetType: string;
  displayName: string;
  description: string;
  creationContext: AssetUploadCreationContext;
}

export interface AssetUploadOperationResponse {
  path: string;
  operationId: string;
  done: boolean;
  error?: AssetUploadErrorResponse;
  response?: {
    path: string;
    revisionId: string;
    revisionCreateTime: string;
    assetId: string | number;
    displayName: string;
    description: string;
    assetType: string;
    creationContext: AssetUploadCreationContext;
    moderationResult: {
      moderationState: string;
    };
  };
}

export interface AssetUploadErrorResponse {
  code?: string | number;
  message?: string;
}

const DEFAULT_ASSET_UPLOAD_ERROR_MESSAGE = 'Asset upload failed';

const getAssetUploadErrorMessage = (error: AssetUploadErrorResponse): string => {
  if (typeof error.message === 'string' && error.message.length > 0) {
    return error.message;
  }

  const { code } = error;
  if (code !== undefined && code !== null && code !== '') {
    return String(code);
  }

  return DEFAULT_ASSET_UPLOAD_ERROR_MESSAGE;
};

const getMimeType = (file: File): string => {
  if (file.type) {
    return file.type;
  }
  const ext = file.name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
};

const createAbortError = (): DOMException => new DOMException('aborted', 'AbortError');

const throwIfAborted = (signal?: AbortSignal): void => {
  if (signal?.aborted) {
    throw createAbortError();
  }
};

const sleep = (ms: number, signal?: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    throwIfAborted(signal);

    let timeout: ReturnType<typeof setTimeout>;
    const handleAbort = (): void => {
      clearTimeout(timeout);
      reject(createAbortError());
    };

    timeout = setTimeout(() => {
      signal?.removeEventListener('abort', handleAbort);
      resolve();
    }, ms);

    signal?.addEventListener('abort', handleAbort, { once: true });
  });

const createAsset = async (
  file: File,
  userId: string,
  displayName: string,
  description = ''
): Promise<AssetUploadOperationResponse> => {
  const requestPayload: AssetUploadRequestPayload = {
    assetType: 'Image',
    displayName,
    description,
    creationContext: {
      creator: { userId }
    }
  };

  const formData = new FormData();
  formData.append('request', JSON.stringify(requestPayload));

  const mimeType = getMimeType(file);
  const blob = new Blob([file], { type: mimeType });
  formData.append('fileContent', blob, file.name);
  formData.append('additionalParameters', OPEN_USE_ADDITIONAL_PARAMETERS);

  const { data } = await httpService.post(
    {
      url: ASSET_UPLOAD_URL,
      withCredentials: true
    },
    formData
  );
  return data as AssetUploadOperationResponse;
};

const getOperation = async (operationId: string): Promise<AssetUploadOperationResponse> => {
  const { data } = await httpService.get({
    url: `${ASSET_UPLOAD_API_BASE}/operations/${operationId}`,
    withCredentials: true,
    retryable: true
  });
  return data as AssetUploadOperationResponse;
};

const waitForOperation = async (
  operationId: string,
  signal?: AbortSignal
): Promise<AssetUploadOperationResponse> => {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    throwIfAborted(signal);
    const delay = Math.min(INITIAL_POLL_INTERVAL_MS * 2 ** attempt, MAX_POLL_INTERVAL_MS);
    // eslint-disable-next-line no-await-in-loop
    await sleep(delay, signal);
    throwIfAborted(signal);
    // eslint-disable-next-line no-await-in-loop
    const result = await getOperation(operationId);
    throwIfAborted(signal);
    if (result.error) {
      throw new Error(getAssetUploadErrorMessage(result.error));
    }
    if (result.done) {
      return result;
    }
  }
  throw new Error('Asset upload operation timed out');
};

const getAssetId = (operation: AssetUploadOperationResponse): number => {
  if (operation.error) {
    throw new Error(getAssetUploadErrorMessage(operation.error));
  }

  const assetId = Number(operation.response?.assetId);
  if (!operation.done || !Number.isSafeInteger(assetId) || assetId <= 0) {
    throw new Error('Asset upload failed: no assetId in response');
  }

  return assetId;
};

const completeOperationAndGetAssetId = async (
  initialOperation: AssetUploadOperationResponse,
  signal?: AbortSignal
): Promise<number> => {
  throwIfAborted(signal);

  if (initialOperation.done || initialOperation.error) {
    return getAssetId(initialOperation);
  }

  if (!initialOperation.operationId) {
    throw new Error('Asset upload failed: no operationId in response');
  }

  const result = await waitForOperation(initialOperation.operationId, signal);
  return getAssetId(result);
};

const uploadImageAndGetAssetId = async (
  file: File,
  userId: string,
  displayName: string,
  signal?: AbortSignal
): Promise<number> => {
  const createResponse = await createAsset(file, userId, displayName);
  return completeOperationAndGetAssetId(createResponse, signal);
};

export default {
  completeOperationAndGetAssetId,
  uploadImageAndGetAssetId
};
