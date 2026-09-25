const readImagePreviewUrl = (
  file: File,
  onLoad: (previewUrl: string) => void,
  onError?: () => void
): void => {
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      onLoad(reader.result);
    } else {
      onError?.();
    }
  };
  reader.onerror = () => onError?.();
  // Data URLs are required because the site's CSP `img-src` allows `data:` but not `blob:`.
  reader.readAsDataURL(file);
};

export default readImagePreviewUrl;
