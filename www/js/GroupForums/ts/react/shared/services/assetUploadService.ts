import { httpService } from 'core-utilities';
import { EnvironmentUrls } from 'Roblox';

const INITIAL_POLL_INTERVAL_MS = 1000;
const MAX_POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 10;

const ASSET_UPLOAD_API_BASE = `${EnvironmentUrls.apiGatewayUrl}/assets/user-auth/v1`;
const ASSET_UPLOAD_URL = `${ASSET_UPLOAD_API_BASE}/assets`;
const OPEN_USE_ADDITIONAL_PARAMETERS = JSON.stringify({ AssetPrivacy: 'OpenUse' });

export interface AssetUploadCreationContext {
  creator: { userId: string };
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
  response?: {
    path: string;
    revisionId: string;
    revisionCreateTime: string;
    assetId: string;
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
  code: string;
  message: string;
}

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

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

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
    if (signal?.aborted) throw new DOMException('aborted', 'AbortError');
    const delay = Math.min(INITIAL_POLL_INTERVAL_MS * 2 ** attempt, MAX_POLL_INTERVAL_MS);
    // eslint-disable-next-line no-await-in-loop
    await sleep(delay);
    if (signal?.aborted) throw new DOMException('aborted', 'AbortError');
    // eslint-disable-next-line no-await-in-loop
    const result = await getOperation(operationId);
    if (result.done) {
      return result;
    }
  }
  throw new Error('Asset upload operation timed out');
};

const uploadImageAndGetAssetId = async (
  file: File,
  userId: string,
  displayName: string,
  signal?: AbortSignal
): Promise<number> => {
  const createResponse = await createAsset(file, userId, displayName);

  if (createResponse.done && createResponse.response?.assetId) {
    return Number(createResponse.response.assetId);
  }

  const result = await waitForOperation(createResponse.operationId, signal);
  if (!result.response?.assetId) {
    throw new Error('Asset upload failed: no assetId in response');
  }
  return Number(result.response.assetId);
};

export default {
  uploadImageAndGetAssetId
};
