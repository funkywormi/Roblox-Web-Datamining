"use client";

import {
  SduiDialog as SduiCoreDialog,
  type SduiDialogProps as SduiCoreDialogProps,
} from "@rbx/sdui-core";
import { SduiImage } from "./SduiImage";

export type SduiDialogProps = Omit<SduiCoreDialogProps, "imageComponent"> & {
  /**
   * sdui-core DialogProps has `[key: string]: unknown` so we need to explicitly set never
   * to indicate that this is not a valid prop
   */
  imageComponent?: never;
};

export function SduiDialog(props: SduiDialogProps) {
  return <SduiCoreDialog {...props} imageComponent={SduiImage} />;
}

export default SduiDialog;
