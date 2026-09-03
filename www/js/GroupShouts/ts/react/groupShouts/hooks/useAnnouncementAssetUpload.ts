import { useCallback, useEffect, useRef, useState } from 'react';
import { CurrentUser } from 'Roblox';
import assetUploadService from '../../shared/services/assetUploadService';
import { FileValidationOptions } from '../../shared/components/fileUpload/types';
import { useFileUpload } from '../../shared/components/fileUpload/hooks/useFileUpload';
import { ASSET_UPLOAD_FAILED_KEY } from '../utils/composerErrors';

const ASSET_DISPLAY_NAME = 'Announcement Image';

// PNG and JPEG only — GIFs are intentionally excluded from announcements.
const ASSET_VALIDATION: FileValidationOptions = {
  accept: 'image/png, image/jpeg',
  maxFileSize: 10 * 1024 * 1024,
  maxFiles: 1
};

export type UseAnnouncementAssetUploadOptions = {
  /**
   * Initial asset id sourced from the composer mode (published announcement or existing draft).
   * The hook hydrates its internal state from this value exactly once — when it first becomes
   * non-null — so a draft loading in asynchronously is supported without clobbering a fresh
   * user upload.
   */
  initialAssetId: number | null;
};

export type UseAnnouncementAssetUploadResult = {
  /**
   * The asset id the composer currently reflects. `0` is the explicit-remove sentinel — the
   * server treats it as "clear the image". `null` means the image has never been uploaded or
   * set. The announcement/draft on the server is NOT updated here; the id only takes effect
   * when the user saves.
   */
  assetId: number | null;
  /** Whether an upload is in flight. */
  isUploading: boolean;
  /** Translation key of the most recent upload error, or null. */
  errorKey: string | null;
  /** Bump-key for `<FileUpload key={...}>` so a failed upload (or explicit remove) remounts. */
  resetKey: number;
  /** Pass to `<FileUpload onChange={...} />`. */
  selectFiles: (files: FileList | File[]) => void;
  /** Clear the composer's current image. Pair with `<FileUpload onRemove={...} />`. */
  removeImage: () => void;
  /** Validation options pinned by the hook so the caller and `useFileUpload` agree. */
  validation: FileValidationOptions;
};

/**
 * Owns the asset-upload subdomain for the announcement composer. Each selection creates a
 * brand-new asset (POST) — the prior in-place PATCH path has been removed because it mutated
 * the shared asset that the live announcement was still pointing at, so a cancel would leak a
 * modified image onto the published record. With POST-only, the server-side announcement /
 * draft is only affected once the user explicitly saves.
 */
export const useAnnouncementAssetUpload = ({
  initialAssetId
}: UseAnnouncementAssetUploadOptions): UseAnnouncementAssetUploadResult => {
  const [assetId, setAssetId] = useState<number | null>(initialAssetId);
  const [isUploading, setIsUploading] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  // Hydrate once from `initialAssetId`. After any user action (upload or remove) the ref flips
  // and later async updates to the prop (e.g. drafts query refetching) do not overwrite what
  // the user has in front of them.
  const hasHydratedRef = useRef<boolean>(initialAssetId != null);
  useEffect(() => {
    if (hasHydratedRef.current) return;
    if (initialAssetId == null) return;
    hasHydratedRef.current = true;
    setAssetId(initialAssetId);
  }, [initialAssetId]);

  // Forward reference so the error path below can clear `useFileUpload`'s internal file state
  // even though the hook is declared further down.
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const clearFilesRef = useRef<() => void>(() => {});

  // Tracks the active upload so it can be aborted on unmount or when a new upload starts.
  const abortControllerRef = useRef<AbortController | null>(null);

  // Abort any in-flight upload when the composer unmounts.
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleFilesSelected = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    const userId = CurrentUser?.userId?.toString();
    if (!userId) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsUploading(true);
    setErrorKey(null);

    try {
      const newAssetId = await assetUploadService.uploadImageAndGetAssetId(
        file,
        userId,
        ASSET_DISPLAY_NAME,
        controller.signal
      );
      setAssetId(newAssetId);
      hasHydratedRef.current = true;
      setIsUploading(false);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        // Component unmounting — skip state updates.
        return;
      }
      setErrorKey(ASSET_UPLOAD_FAILED_KEY);
      clearFilesRef.current();
      setResetKey(prev => prev + 1);
      setIsUploading(false);
    }
  }, []);

  const { selectFiles, clearFiles } = useFileUpload({
    validation: ASSET_VALIDATION,
    preview: {
      enableImagePreview: true,
      maxPreviewWidth: 300,
      maxPreviewHeight: 300,
      showMetadata: true
    },
    autoValidate: true,
    autoPreview: true,
    onFilesSelected: handleFilesSelected
  });

  clearFilesRef.current = clearFiles;

  const removeImage = useCallback(() => {
    setAssetId(0);
    setErrorKey(null);
    clearFilesRef.current();
    setResetKey(prev => prev + 1);
    hasHydratedRef.current = true;
  }, []);

  return {
    assetId,
    isUploading,
    errorKey,
    resetKey,
    selectFiles,
    removeImage,
    validation: ASSET_VALIDATION
  };
};
