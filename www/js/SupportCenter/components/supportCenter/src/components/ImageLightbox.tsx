import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import classNames from "classnames";
import { useTranslation } from "@rbx/core-scripts/react";
import { Loading } from "@rbx/core-ui";
import { IconButton } from "@rbx/foundation-ui";
import { Thumbnail2d, ThumbnailAssetsSize, ThumbnailTypes } from "@rbx/thumbnails";
import environmentUrls from "@rbx/environment-urls";

interface ImageLightboxProps {
  assetIds: number[];
  initialIndex: number;
  title?: string;
  onClose: () => void;
}

const getAssetUrl = (assetId: number) =>
  `${environmentUrls.assetDeliveryApi}/v1/asset/?id=${assetId}`;

const ImageLightbox: React.FC<ImageLightboxProps> = ({
  assetIds,
  initialIndex,
  title,
  onClose,
}) => {
  const { translate } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [imageLoaded, setImageLoaded] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex < assetIds.length - 1;

  const changeImage = useCallback((newIndex: number) => {
    setSelectedIndex(newIndex);
    setImageLoaded(false);
    // handle images loaded from cache (onLoad may not fire)
    requestAnimationFrame(() => {
      if (imgRef.current?.complete) {
        setImageLoaded(true);
      }
    });
  }, []);

  const goToPrev = useCallback(() => {
    if (hasPrev) changeImage(selectedIndex - 1);
  }, [hasPrev, selectedIndex, changeImage]);

  const goToNext = useCallback(() => {
    if (hasNext) changeImage(selectedIndex + 1);
  }, [hasNext, selectedIndex, changeImage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, goToPrev, goToNext]);

  if (!assetIds.length) return null;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const currentAssetId = assetIds[selectedIndex]!;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  };

  const component = (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      className="lightbox-backdrop"
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onClick={handleBackdropClick}
      onKeyDown={e => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="lightbox-topbar">
        <div className="width-[32px] text-white shrink-0">
          {assetIds.length > 1 && `${selectedIndex + 1}/${assetIds.length}`}
        </div>
        {title && (
          <h3 className="text-white grow-1 max-width-[60%] flex items-center justify-center">
            {title}
          </h3>
        )}
        <IconButton
          className="width-[32px] shrink-0"
          icon="icon-filled-x"
          iconColor="Inverse"
          variant="Utility"
          size="Large"
          onClick={onClose}
          ariaLabel={translate("Action.Close")}
        />
      </div>

      <div className="relative flex items-center justify-center">
        {!imageLoaded && (
          <div className="absolute">
            <Loading className="height-[200px] width-[200px]" />
          </div>
        )}
        <img
          ref={imgRef}
          className={classNames("lightbox-image", !imageLoaded && "hidden")}
          src={getAssetUrl(currentAssetId)}
          alt=""
          onLoad={() => {
            setImageLoaded(true);
          }}
        />
      </div>

      {assetIds.length > 1 && (
        <React.Fragment>
          <IconButton
            className="lightbox-arrow left"
            icon="icon-filled-chevron-large-left"
            iconColor="Inverse"
            ariaLabel={translate("Action.Previous")}
            variant="Utility"
            isDisabled={!hasPrev}
            onClick={goToPrev}
          />
          <IconButton
            className="lightbox-arrow right"
            icon="icon-filled-chevron-large-right"
            iconColor="Inverse"
            ariaLabel={translate("Action.Next")}
            variant="Utility"
            isDisabled={!hasNext}
            onClick={goToNext}
          />
        </React.Fragment>
      )}

      {assetIds.length > 1 && (
        <div className="lightbox-thumbnails flex gap-small">
          {assetIds.map((assetId, index) => (
            <button
              key={assetId}
              type="button"
              className={`lightbox-thumbnail ${index === selectedIndex ? "selected" : ""}`}
              onClick={() => {
                changeImage(index);
              }}
            >
              <Thumbnail2d
                containerClass="width-full height-full block flex justify-center"
                imgClassName="object-fit-cover"
                targetId={assetId}
                type={ThumbnailTypes.assetThumbnail}
                size={ThumbnailAssetsSize.size150}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return createPortal(component, document.body);
};

export default ImageLightbox;
