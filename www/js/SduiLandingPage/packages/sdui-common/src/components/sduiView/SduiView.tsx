import {
  expandManagedList,
  SDUI_MANAGED_CHILDREN_PROP,
  type SduiDim2,
  type SduiRendererInjectedProps,
  type SduiScaleBasis,
  type SduiTokenOrLiteral,
  type SduiVector2,
} from "@rbx/sdui-core";
import { getViewStyles } from "./viewStyleUtils";

export interface SduiViewProps extends SduiRendererInjectedProps {
  /**
   * Web-only space-separated CSS/utility class names from `ViewSchema.WebProps.class_names`.
   * Foundation `tag` is intentionally ignored on web.
   */
  classNames?: string;
  size?: SduiDim2;
  /** Web-only max-width in px (or token). */
  maxWidth?: SduiTokenOrLiteral;
  /** Web-only. What `size.yScale` resolves against — `"parent"` (default) or `"viewport"`. */
  yScaleBasis?: SduiScaleBasis;
  anchorPoint?: SduiVector2;
  position?: SduiDim2;
  zIndex?: number;
  clipsDescendants?: boolean;
  visible?: boolean;
  backgroundStyle?: SduiTokenOrLiteral;
}

/**
 * Web layout container for ViewSchema. Renders nested SDUI children from
 * `sduiManagedChildren` (injected by `SduiRenderer` when `doesManageChildren` is true)
 * and applies classes from web-only `classNames`.
 */
export function SduiView(props: SduiViewProps) {
  const {
    classNames,
    size,
    maxWidth,
    yScaleBasis,
    anchorPoint,
    position,
    zIndex,
    clipsDescendants,
    visible,
    backgroundStyle,
    [SDUI_MANAGED_CHILDREN_PROP]: managedChildren,
  } = props;

  const viewStyles = getViewStyles({
    classNames,
    size,
    maxWidth,
    yScaleBasis,
    anchorPoint,
    position,
    zIndex,
    clipsDescendants,
    visible,
    backgroundStyle,
  });

  return (
    <div data-testid="sdui-view" {...viewStyles}>
      {expandManagedList(managedChildren)}
    </div>
  );
}
