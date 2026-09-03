export enum ValidationErrorType {
  FILE_TYPE = 'FILE_TYPE',
  FILE_SIZE = 'FILE_SIZE',
  CUSTOM = 'CUSTOM'
}

export interface ValidationError {
  type: ValidationErrorType;
  messageKey: string;
  messageMeta?: Record<string, unknown>;
  file?: File;
}

export type CustomValidator = (
  file: File
) => { messageKey: string; messageMeta?: Record<string, unknown> };

export interface FileValidationOptions {
  accept?: string;
  maxFileSize?: number;
  maxFiles?: number;
  customValidators?: CustomValidator[];
}

export interface FileState {
  files: File[];
  errors: ValidationError[];
}

export interface PreviewOptions {
  enableImagePreview?: boolean;
  maxPreviewWidth?: number;
  maxPreviewHeight?: number;
  showMetadata?: boolean;
}
