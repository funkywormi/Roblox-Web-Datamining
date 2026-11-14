import { useEffect, useMemo, useState } from "react";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { linkifyText } from "./segments";

/** `linkifyText` for React. The first render treats the device as not a phone so server and hydration markup agree. */
export const useLinkifiedText = (text: string | null | undefined): string => {
  const [isPhone, setIsPhone] = useState(false);
  useEffect(() => {
    setIsPhone(getDeviceMeta()?.isPhone ?? false);
  }, []);
  return useMemo(() => linkifyText(text ?? "", isPhone), [text, isPhone]);
};
