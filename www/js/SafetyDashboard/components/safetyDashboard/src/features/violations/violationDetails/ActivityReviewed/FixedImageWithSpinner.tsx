import { useState } from "react";
import { captureException } from "@sentry/react";
import { ProgressCircle } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import * as httpService from "@rbx/core-scripts/http";

interface Props {
  url: string;
  altLabelKey?: string;
}

/**
 * A component that displays an image or a loading spinner if the image is still loading.
 * The container is styled to ensure that no layout shifts occur when the image is loading.
 */
const FixedImageWithSpinner = ({ url, altLabelKey }: Props): JSX.Element => {
  const { translate } = useTranslation();
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

          // onError doesn't contain any error information so we need to manually hit the image URL again to get it.
          httpService
            .get({
              url,
              withCredentials: true,
            })
            .then(response => {
              captureException(
                new Error(`Image loaded with HTTP ${response.status} but failed to render`),
                {
                  tags: { component: "FixedImageWithSpinner" },
                  extra: {
                    url,
                    httpStatus: response.status,
                    httpStatusText: response.statusText,
                  },
                },
              );
            })
            .catch((error: unknown) => {
              captureException(error, {
                tags: { component: "FixedImageWithSpinner" },
                extra: { url },
              });
            });
        }}
      />

      <div data-testid="spinner-container" className={loading ? undefined : "hidden"}>
        <ProgressCircle
          ariaLabel={translate("Label.Loading")}
          size="Medium"
          variant="Indeterminate"
        />
      </div>
    </div>
  );
};

export default FixedImageWithSpinner;
