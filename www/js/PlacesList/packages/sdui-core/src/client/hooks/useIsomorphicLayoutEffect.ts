import { useEffect, useLayoutEffect } from "react";
import { window as browserWindow } from "@rbx/core-lib/browser";

export const useIsomorphicLayoutEffect = browserWindow ? useLayoutEffect : useEffect;
