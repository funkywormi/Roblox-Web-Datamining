import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CurrentUser } from 'Roblox';
import assetUploadService from '../../shared/services/assetUploadService';
import {
  FileValidationOptions,
  ValidationError,
  ValidationErrorType
} from '../../shared/components/fileUpload/types';
import { validateFile } from '../../shared/components/fileUpload/utils/validation';
import { ASSET_UPLOAD_FAILED_KEY } from '../../shared/constants/assetUploadConstants';

export const MAX_SCREENSHOTS = 3;

const SCREENSHOT_DISPLAY_NAME = 'Bug Report Screenshot';

const MAX_FILE_SIZE_MB = 10;

// Shown in the "wrong file type" message; the raw `accept` MIME list reads poorly.
const SCREENSHOT_FILE_TYPES_LABEL = 'PNG, JPG';

const SCREENSHOT_VALIDATION: FileValidationOptions & { accept: string } = {
  accept: 'image/png, image/jpeg',
  maxFileSize: MAX_FILE_SIZE_MB * 1024 * 1024
};

export type ScreenshotErrorMeta = Record<string, string | number>;

type ScreenshotError = {
  key: string;
  meta?: ScreenshotErrorMeta;
};

/** One selected screenshot, from the moment it is picked until the field is reset. */
export type Screenshot = {
  /** Identity for React keys and removal; survives the upload resolving. */
  key: number;
  /** `null` while the upload is in flight. */
  assetId: number | null;
  /**
   * `data:` URL of the picked file, retained after upload so the UI never waits for a moderated
   * asset thumbnail. Screenshots restored from a saved in-memory draft carry this value too.
   */
  previewUrl?: string;
  /** True while a newly selected file is still being read for its local preview. */
  isPreviewLoading?: boolean;
};

/**
 * `Feature.FileUploadComponent`'s validation strings take their own params — `Message.InvalidFile`
 * wants `fileTypes` and `Message.InvalidFileSize` wants `fileSize` in MB — which do not match the
 * `messageMeta` the shared validator emits, so the params are rebuilt from the options above.
 */
const toScreenshotError = (validationError: ValidationError): ScreenshotError => {
  switch (validationError.type) {
    case ValidationErrorType.FILE_TYPE:
      return {
        key: validationError.messageKey,
        meta: { fileTypes: SCREENSHOT_FILE_TYPES_LABEL }
      };
    case ValidationErrorType.FILE_SIZE:
      return { key: validationError.messageKey, meta: { fileSize: MAX_FILE_SIZE_MB } };
    default:
      return { key: ASSET_UPLOAD_FAILED_KEY };
  }
};

/**
 * Reads the picked file for a local preview. The site's CSP `img-src` allows `data:` but not
 * `blob:`, so this reads a data URL rather than calling `URL.createObjectURL` — the same approach
 * `FileUpload` takes for the emblem and cover previews.
 */
const readPreviewUrl = (
  file: File,
  onLoad: (previewUrl: string) => void,
  onError: () => void
): void => {
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      onLoad(reader.result);
    } else {
      onError();
    }
  };
  reader.onerror = onError;
  reader.readAsDataURL(file);
};

export type UseSupportTicketScreenshotsResult = {
  /** Every screenshot in the order it was picked, uploaded or not. */
  screenshots: Screenshot[];
  /** Asset ids of the finished uploads, for submission. */
  assetIds: number[];
  /** Whether any asset upload or local preview read is in flight. */
  isUploading: boolean;
  /** Latest upload or validation error key. */
  errorKey: string | null;
  /** Translation params for `errorKey`, for the messages that take them. */
  errorMeta?: ScreenshotErrorMeta;
  /** Remaining upload capacity. */
  remainingSlots: number;
  addFiles: (files: FileList | File[]) => void;
  removeByKey: (key: number) => void;
  reset: (nextAssetIds?: number[], nextPreviewUrls?: Array<string | undefined>) => void;
  /** `accept` is narrowed to required so callers can pass it straight to the file input. */
  validation: FileValidationOptions & { accept: string };
};

/** Uploads and tracks bug-report screenshots. */
export const useSupportTicketScreenshots = (
  initialAssetIds: number[] = [],
  initialPreviewUrls: Array<string | undefined> = []
): UseSupportTicketScreenshotsResult => {
  const nextKeyRef = useRef(0);
  const takeKey = useCallback(() => {
    nextKeyRef.current += 1;
    return nextKeyRef.current;
  }, []);

  const hydrate = useCallback(
    (assetIds: number[], previewUrls: Array<string | undefined> = []): Screenshot[] =>
      assetIds.map((assetId, index) => ({
        key: takeKey(),
        assetId,
        previewUrl: previewUrls[index]
      })),
    [takeKey]
  );

  const [screenshots, setScreenshots] = useState<Screenshot[]>(() =>
    hydrate(initialAssetIds, initialPreviewUrls)
  );
  /**
   * Mirrors the `screenshots` state so `addFiles` can count occupied slots without waiting for a
   * re-render. Seeded from the state's initial value, since `useRef` keeps only its first argument.
   * Every write goes through `commitScreenshots`, which is the only thing that touches either the
   * ref or the state.
   */
  const screenshotsRef = useRef<Screenshot[]>(screenshots);
  const [error, setError] = useState<ScreenshotError | null>(null);

  const commitScreenshots = useCallback((update: (prev: Screenshot[]) => Screenshot[]) => {
    screenshotsRef.current = update(screenshotsRef.current);
    setScreenshots(screenshotsRef.current);
  }, []);

  // Prevent stale uploads from updating a reset or unmounted field.
  const abortControllerRef = useRef<AbortController>(new AbortController());

  useEffect(() => {
    return () => abortControllerRef.current.abort();
  }, []);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const userId = CurrentUser?.userId?.toString();
      if (!userId) return;

      const candidates = Array.from(files);
      if (candidates.length === 0) return;

      const { signal } = abortControllerRef.current;
      let nextError: ScreenshotError | null = null;
      const accepted: { screenshot: Screenshot; file: File }[] = [];

      for (const file of candidates) {
        if (screenshotsRef.current.length + accepted.length >= MAX_SCREENSHOTS) break;

        // The file dialog's `accept` filter can be bypassed.
        // `validateFile` reports type before size, so the first error is the one to fix first.
        const [validationError] = validateFile(file, SCREENSHOT_VALIDATION);
        if (validationError) {
          nextError = toScreenshotError(validationError);
          // eslint-disable-next-line no-continue
          continue;
        }

        accepted.push({
          screenshot: { key: takeKey(), assetId: null, isPreviewLoading: true },
          file
        });
      }

      setError(nextError);
      if (accepted.length === 0) return;

      // Claiming the slots up front is what keeps thumbnails in the order they were picked:
      // an upload resolving only fills in its own asset id.
      commitScreenshots(prev => [...prev, ...accepted.map(({ screenshot }) => screenshot)]);

      accepted.forEach(({ screenshot, file }) => {
        readPreviewUrl(
          file,
          previewUrl => {
            if (signal.aborted) return;
            commitScreenshots(prev =>
              prev.map(current =>
                current.key === screenshot.key
                  ? { ...current, previewUrl, isPreviewLoading: false }
                  : current
              )
            );
          },
          () => {
            if (signal.aborted) return;
            commitScreenshots(prev => prev.filter(current => current.key !== screenshot.key));
            setError({ key: ASSET_UPLOAD_FAILED_KEY });
          }
        );

        assetUploadService
          .uploadImageAndGetAssetId(file, userId, SCREENSHOT_DISPLAY_NAME, signal)
          .then(assetId => {
            if (signal.aborted) return;
            commitScreenshots(prev =>
              prev.map(current =>
                current.key === screenshot.key ? { ...current, assetId } : current
              )
            );
          })
          .catch((uploadError: unknown) => {
            if (
              signal.aborted ||
              (uploadError instanceof DOMException && uploadError.name === 'AbortError')
            ) {
              return;
            }
            commitScreenshots(prev => prev.filter(current => current.key !== screenshot.key));
            setError({ key: ASSET_UPLOAD_FAILED_KEY });
          });
      });
    },
    [commitScreenshots, takeKey]
  );

  const removeByKey = useCallback(
    (key: number) => {
      setError(null);
      commitScreenshots(prev => prev.filter(current => current.key !== key));
    },
    [commitScreenshots]
  );

  const reset = useCallback(
    (nextAssetIds: number[] = [], nextPreviewUrls: Array<string | undefined> = []) => {
      abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
      commitScreenshots(() => hydrate(nextAssetIds, nextPreviewUrls));
      setError(null);
    },
    [commitScreenshots, hydrate]
  );

  const assetIds = useMemo(
    () =>
      screenshots
        .map(screenshot => screenshot.assetId)
        .filter((assetId): assetId is number => assetId !== null),
    [screenshots]
  );

  return {
    screenshots,
    assetIds,
    isUploading: screenshots.some(
      screenshot => screenshot.assetId === null || screenshot.isPreviewLoading === true
    ),
    errorKey: error?.key ?? null,
    errorMeta: error?.meta,
    remainingSlots: Math.max(0, MAX_SCREENSHOTS - screenshots.length),
    addFiles,
    removeByKey,
    reset,
    validation: SCREENSHOT_VALIDATION
  };
};
