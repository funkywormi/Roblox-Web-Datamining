import { useState, useEffect, useCallback } from 'react';
import { uuidService } from 'core-utilities';
import { PreviewOptions } from '../types';
import { isImageFile } from '../utils/validation';

export interface FilePreview {
  id: string;
  file: File;
  previewUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface UseFilePreviewResult {
  previews: FilePreview[];
  generatePreviews: (files: File[]) => void;
  clearPreviews: () => void;
  removePreview: (id: string) => void;
}

const generateId = (): string => {
  return uuidService.generateRandomUuid();
};

/**
 * Hook to generate and manage file previews (especially for images)
 * @param options - Preview configuration options
 * @returns Preview utilities and state
 */
export const useFilePreview = (options: PreviewOptions = {}): UseFilePreviewResult => {
  const { enableImagePreview = true } = options;

  const [previews, setPreviews] = useState<FilePreview[]>([]);

  const generatePreviews = useCallback(
    (files: File[]) => {
      const newPreviews: FilePreview[] = files.map(file => ({
        id: generateId(),
        file,
        previewUrl: null,
        isLoading: true,
        error: null
      }));

      setPreviews(newPreviews);

      if (enableImagePreview) {
        newPreviews.forEach(preview => {
          if (isImageFile(preview.file)) {
            const reader = new FileReader();

            reader.onload = e => {
              const result = e.target?.result;
              if (typeof result === 'string') {
                setPreviews(prev =>
                  prev.map(p =>
                    p.id === preview.id ? { ...p, previewUrl: result, isLoading: false } : p
                  )
                );
              }
            };

            reader.onerror = () => {
              setPreviews(prev =>
                prev.map(p =>
                  p.id === preview.id
                    ? { ...p, error: 'Failed to load preview', isLoading: false }
                    : p
                )
              );
            };

            reader.readAsDataURL(preview.file);
          } else {
            // Not an image, just mark as not loading
            setPreviews(prev =>
              prev.map(p => (p.id === preview.id ? { ...p, isLoading: false } : p))
            );
          }
        });
      }
    },
    [enableImagePreview]
  );

  const clearPreviews = useCallback(() => {
    // Revoke object URLs to prevent memory leaks
    previews.forEach(preview => {
      if (preview.previewUrl && preview.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(preview.previewUrl);
      }
    });
    setPreviews([]);
  }, [previews]);

  const removePreview = useCallback((id: string) => {
    setPreviews(prev => {
      const preview = prev.find(p => p.id === id);
      if (preview?.previewUrl && preview.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(preview.previewUrl);
      }
      return prev.filter(p => p.id !== id);
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      previews.forEach(preview => {
        if (preview.previewUrl && preview.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(preview.previewUrl);
        }
      });
    };
  }, [previews]);

  return {
    previews,
    generatePreviews,
    clearPreviews,
    removePreview
  };
};
