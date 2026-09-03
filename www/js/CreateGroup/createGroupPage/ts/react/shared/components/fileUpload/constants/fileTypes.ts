/**
 * Supported file types for file upload component.
 * Maps file type categories to their accepted MIME types.
 * These can be used with the HTML input accept attribute.
 */
export const fileTypes = {
  image: 'image/png, image/jpeg'
} as const;

export type FileTypeKey = keyof typeof fileTypes;
export type FileTypeValue = typeof fileTypes[FileTypeKey];
