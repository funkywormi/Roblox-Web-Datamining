import { clsx } from "clsx";
import type { CSSProperties } from "react";
import { buildObjectFitCss, type SduiScaleType } from "@rbx/sdui-core";

interface GetVideoPlayerStylesParams {
  scaleType?: SduiScaleType;
  isReady: boolean;
}

export const getVideoPlayerStyles = ({ scaleType, isReady }: GetVideoPlayerStylesParams) => {
  const objectFit = scaleType != null ? buildObjectFitCss(scaleType) : undefined;

  return {
    rootStyles: {
      className: clsx(
        "relative clip width-full height-full",
        // Same pattern as game-tile CSS: size RobloxVideoPlayer's unsized wrapper so object-fit can crop.
        "[&>*]:width-full [&>*]:height-full",
      ),
    },
    // Forwarded onto the <video> via RobloxVideoPlayer → @rbx/ui Video className/style.
    // Opacity-only (no visibility toggle) so the poster underneath stays visible while the video fades in.
    videoPlayerStyles: {
      className: clsx(
        "relative height-full transition-opacity",
        isReady ? "opacity-[1]" : "opacity-[0]",
      ),
      style: (objectFit != null ? { objectFit } : undefined) satisfies CSSProperties | undefined,
    },
    loadingStyles: {
      // Painted under the video (DOM order + absolute) so the fade blends over the poster.
      className: "absolute top-[0] left-[0] width-full height-full pointer-events-none",
    },
  };
};
