import {
  ValidationError,
  ValidationErrorType,
  FileValidationOptions,
  CustomValidator
} from '../types';
import errorMessageKeys from '../constants/errorMessageKeys';

const parseAcceptString = (accept: string): string[] => {
  return accept
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(item => item.length > 0);
};

const isFileTypeAccepted = (file: File, accept: string): boolean => {
  const acceptedTypes = parseAcceptString(accept);
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  return acceptedTypes.some(acceptedType => {
    // Check if it's an extension (starts with .)
    if (acceptedType.startsWith('.')) {
      return fileName.endsWith(acceptedType);
    }

    // Check for wildcard MIME type (e.g., image/*)
    if (acceptedType.endsWith('/*')) {
      const baseType = acceptedType.slice(0, -2);
      return fileType.startsWith(baseType);
    }

    // Exact MIME type match
    return fileType === acceptedType;
  });
};

export const isImageFile = (file: File): boolean => {
  return file.type.toLowerCase().startsWith('image/');
};

export const validateFileType = (file: File, accept?: string): ValidationError | null => {
  if (!accept) {
    return null;
  }

  if (!isFileTypeAccepted(file, accept)) {
    return {
      type: ValidationErrorType.FILE_TYPE,
      messageKey: errorMessageKeys.INVALID_FILE_TYPE,
      file
    };
  }

  return null;
};

export const validateFileSize = (file: File, maxFileSize?: number): ValidationError | null => {
  if (!maxFileSize) {
    return null;
  }

  if (file.size > maxFileSize) {
    return {
      type: ValidationErrorType.FILE_SIZE,
      messageKey: errorMessageKeys.FILE_TOO_LARGE,
      messageMeta: { maxSize: maxFileSize },
      file
    };
  }

  return null;
};

export const validateCustom = (
  file: File,
  validators?: CustomValidator[]
): ValidationError | null => {
  if (!validators || validators.length === 0) {
    return null;
  }

  for (const validator of validators) {
    const { messageKey, messageMeta } = validator(file);
    if (messageKey) {
      return {
        type: ValidationErrorType.CUSTOM,
        messageKey,
        messageMeta,
        file
      };
    }
  }

  return null;
};

export const validateFile = (
  file: File,
  options: FileValidationOptions = {}
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate file type
  const typeError = validateFileType(file, options.accept);
  if (typeError) {
    errors.push(typeError);
  }

  // Validate file size
  const sizeError = validateFileSize(file, options.maxFileSize);
  if (sizeError) {
    errors.push(sizeError);
  }

  // Validate custom rules
  const customError = validateCustom(file, options.customValidators);
  if (customError) {
    errors.push(customError);
  }

  return errors;
};

export const validateFiles = (
  files: FileList | File[],
  options: FileValidationOptions = {}
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate each file
  const fileArray = files instanceof FileList ? Array.from(files) : files;
  fileArray.forEach(file => {
    const fileErrors = validateFile(file, options);
    errors.push(...fileErrors);
  });

  return errors;
};

export const areFilesValid = (
  files: FileList | File[],
  options: FileValidationOptions = {}
): boolean => {
  return validateFiles(files, options).length === 0;
};
