import { useMemo } from "react";
import useSduiSocialData from "./useSduiSocialData";
import { TSduiDataStore, TSduiPageContext } from "../system/SduiTypes";

const useSduiDataStore = (pageContext: TSduiPageContext): TSduiDataStore => {
  const socialData = useSduiSocialData(pageContext);

  return useMemo(() => {
    return {
      social: socialData,
    };
  }, [socialData]);
};

export default useSduiDataStore;
