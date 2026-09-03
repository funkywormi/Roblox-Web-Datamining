import { useState } from "react";
import { ProgressCircle } from "@rbx/foundation-ui";
import { useNotApprovedTranslate } from "../providers/NotApprovedUIProvider";

interface Props {
  url: string;
  altLabelKey?: string;
}

/**
 * A component that displays an image or a loading spinner if the image is still loading.
 * The container is styled to ensure that no layout shifts occur when the image is loading.
 */
const ImageWithSpinner = ({ url, altLabelKey }: Props): JSX.Element => {
  const translate = useNotApprovedTranslate();
  const [loading, setLoading] = useState(true);

  return (
    <div className="flex aspect-1-1 justify-center items-center bg-shift-200 radius-medium">
      <img
        style={{ objectFit: "contain" }}
        className={`size-full ${loading ? "hidden" : ""}`}
        src={url}
        alt={altLabelKey && translate(altLabelKey)}
        onLoad={() => {
          setLoading(false);
        }}
        onError={() => {
          setLoading(false);
        }}
      />

      <div data-testid="spinner-container" className={loading ? undefined : "hidden"}>
        <ProgressCircle
          ariaLabel={translate("Label.LoadingImage")}
          size="Medium"
          variant="Indeterminate"
        />
      </div>
    </div>
  );
};

export default ImageWithSpinner;
