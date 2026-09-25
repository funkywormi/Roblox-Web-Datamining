import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FileValidationOptions,
  ValidationError,
  ValidationErrorType
} from '../../shared/components/fileUpload/types';
import { validateFile } from '../../shared/components/fileUpload/utils/validation';
import readImagePreviewUrl from '../../shared/components/fileUpload/utils/readImagePreviewUrl';
import { ASSET_UPLOAD_FAILED_KEY } from '../../shared/constants/assetUploadConstants';
import forumImageUploadService from '../services/forumImageUploadService';

export const MAX_FORUM_IMAGES = 3;
export const MAX_FORUM_IMAGE_FILE_SIZE_MB = 10;

const MAX_FORUM_IMAGE_FILE_SIZE_BYTES = MAX_FORUM_IMAGE_FILE_SIZE_MB * 1024 * 1024;

const FORUM_IMAGE_ACCEPT = 'image/png, image/jpeg';
const FORUM_IMAGE_FILE_TYPES_LABEL = 'PNG, JPG';
const FORUM_IMAGE_VALIDATION: FileValidationOptions & { accept: string } = {
  accept: FORUM_IMAGE_ACCEPT,
  maxFileSize: MAX_FORUM_IMAGE_FILE_SIZE_BYTES
};

export type ForumImageUploadStatus = 'uploading' | 'uploaded' | 'failed';

export type ForumImageUpload = {
  key: number;
  previewUrl?: string;
  assetId?: number;
  status: ForumImageUploadStatus;
};

export type ForumImageUploadErrorMeta = Record<string, string | number>;

type ForumImageUploadError = {
  key: string;
  meta?: ForumImageUploadErrorMeta;
};

export type UseForumImageUploadsParams = {
  groupId: number;
  categoryId?: string;
  enabled: boolean;
};

export type UseForumImageUploadsResult = {
  images: ForumImageUpload[];
  assetIds: number[];
  isSubmitBlocked: boolean;
  errorKey: string | null;
  errorMeta?: ForumImageUploadErrorMeta;
  remainingSlots: number;
  validation: FileValidationOptions & { accept: string };
  addFiles: (files: FileList | File[]) => void;
  removeByKey: (key: number) => void;
  reset: () => void;
};

const toForumImageError = (validationError: ValidationError): ForumImageUploadError => {
  switch (validationError.type) {
    case ValidationErrorType.FILE_TYPE:
      return {
        key: validationError.messageKey,
        meta: { fileTypes: FORUM_IMAGE_FILE_TYPES_LABEL }
      };
    case ValidationErrorType.FILE_SIZE:
      return {
        key: validationError.messageKey,
        meta: { fileSize: MAX_FORUM_IMAGE_FILE_SIZE_MB }
      };
    default:
      return { key: ASSET_UPLOAD_FAILED_KEY };
  }
};

export const useForumImageUploads = ({
  groupId,
  categoryId,
  enabled
}: UseForumImageUploadsParams): UseForumImageUploadsResult => {
  const nextKeyRef = useRef(0);
  const takeKey = useCallback(() => {
    nextKeyRef.current += 1;
    return nextKeyRef.current;
  }, []);

  const [images, setImages] = useState<ForumImageUpload[]>([]);
  const imagesRef = useRef<ForumImageUpload[]>([]);
  const [error, setError] = useState<ForumImageUploadError | null>(null);
  const abortControllersRef = useRef<Map<number, AbortController>>(new Map());
  const uploadContextRef = useRef({ groupId, categoryId, enabled });
  uploadContextRef.current = { groupId, categoryId, enabled };

  const commitImages = useCallback(
    (update: (previous: ForumImageUpload[]) => ForumImageUpload[]) => {
      imagesRef.current = update(imagesRef.current);
      setImages(imagesRef.current);
    },
    []
  );

  const removeByKey = useCallback(
    (key: number) => {
      abortControllersRef.current.get(key)?.abort();
      abortControllersRef.current.delete(key);
      commitImages(previous => previous.filter(image => image.key !== key));
      if (!imagesRef.current.some(image => image.status === 'failed')) {
        setError(null);
      }
    },
    [commitImages]
  );

  const clearFailedUploads = useCallback(() => {
    let hasFailedUpload = false;
    for (const image of imagesRef.current) {
      if (image.status === 'failed') {
        hasFailedUpload = true;
        abortControllersRef.current.get(image.key)?.abort();
        abortControllersRef.current.delete(image.key);
      }
    }

    if (hasFailedUpload) {
      commitImages(previous => previous.filter(image => image.status !== 'failed'));
    }
    setError(null);
  }, [commitImages]);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const {
        groupId: uploadGroupId,
        categoryId: uploadCategoryId,
        enabled: isUploadEnabled
      } = uploadContextRef.current;
      if (!isUploadEnabled || !uploadCategoryId) {
        return;
      }

      const candidates = Array.from(files);
      if (candidates.length === 0) {
        return;
      }

      clearFailedUploads();

      let nextError: ForumImageUploadError | null = null;
      const accepted: Array<{ key: number; file: File; abortController: AbortController }> = [];
      for (const file of candidates) {
        if (imagesRef.current.length + accepted.length >= MAX_FORUM_IMAGES) {
          break;
        }

        const [validationError] = validateFile(file, FORUM_IMAGE_VALIDATION);
        if (validationError) {
          nextError = toForumImageError(validationError);
          // eslint-disable-next-line no-continue
          continue;
        }

        const key = takeKey();
        const abortController = new AbortController();
        abortControllersRef.current.set(key, abortController);
        accepted.push({ key, file, abortController });
      }

      setError(nextError);
      if (accepted.length === 0) {
        return;
      }

      commitImages(previous => [
        ...previous,
        ...accepted.map(({ key }) => ({ key, status: 'uploading' as const }))
      ]);

      accepted.forEach(({ key, file, abortController }) => {
        readImagePreviewUrl(
          file,
          previewUrl => {
            if (abortController.signal.aborted) {
              return;
            }
            commitImages(previous =>
              previous.map(image => (image.key === key ? { ...image, previewUrl } : image))
            );
          },
          () => {
            if (abortController.signal.aborted) {
              return;
            }
            removeByKey(key);
            setError({ key: ASSET_UPLOAD_FAILED_KEY });
          }
        );

        forumImageUploadService
          .uploadImageAndGetAssetId(uploadGroupId, uploadCategoryId, file, abortController.signal)
          .then(assetId => {
            if (abortController.signal.aborted) {
              return;
            }
            commitImages(previous =>
              previous.map(image =>
                image.key === key ? { ...image, assetId, status: 'uploaded' } : image
              )
            );
          })
          .catch((uploadError: unknown) => {
            if (
              abortController.signal.aborted ||
              (uploadError instanceof DOMException && uploadError.name === 'AbortError')
            ) {
              return;
            }
            commitImages(previous =>
              previous.map(image => (image.key === key ? { ...image, status: 'failed' } : image))
            );
            setError({ key: ASSET_UPLOAD_FAILED_KEY });
          });
      });
    },
    [clearFailedUploads, commitImages, removeByKey, takeKey]
  );

  const reset = useCallback(() => {
    abortControllersRef.current.forEach(controller => controller.abort());
    abortControllersRef.current.clear();
    commitImages(() => []);
    setError(null);
  }, [commitImages]);

  useEffect(() => {
    reset();
  }, [groupId, categoryId, enabled, reset]);

  useEffect(() => {
    const abortControllers = abortControllersRef.current;
    return () => {
      abortControllers.forEach(controller => controller.abort());
    };
  }, []);

  const assetIds = useMemo(
    () =>
      images
        .filter(
          (image): image is ForumImageUpload & { assetId: number } =>
            image.status === 'uploaded' && image.assetId !== undefined
        )
        .map(image => image.assetId),
    [images]
  );

  return {
    images,
    assetIds,
    isSubmitBlocked: images.some(image => image.status !== 'uploaded'),
    errorKey: error?.key ?? null,
    errorMeta: error?.meta,
    remainingSlots: Math.max(
      0,
      MAX_FORUM_IMAGES - images.filter(image => image.status !== 'failed').length
    ),
    validation: FORUM_IMAGE_VALIDATION,
    addFiles,
    removeByKey,
    reset
  };
};
