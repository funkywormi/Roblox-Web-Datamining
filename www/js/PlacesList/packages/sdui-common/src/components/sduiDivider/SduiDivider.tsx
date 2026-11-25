import { Divider } from "@rbx/foundation-ui";
import type { SduiRendererInjectedProps } from "@rbx/sdui-core";

export type SduiDividerProps = SduiRendererInjectedProps;

/**
 * Web layout for DividerSchema. The schema carries no props — templates place a
 * divider purely as a separator between feed items.
 */
export function SduiDivider(_props: SduiDividerProps) {
  return <Divider data-testid="sdui-divider" orientation="horizontal" />;
}
