import { useMemo } from "react";
import { TSduiContext, TServerDrivenComponentConfig } from "../system/SduiTypes";

const useResolveItemTemplateConfigs = (
  sduiContext: TSduiContext,
  items?: TServerDrivenComponentConfig[],
  itemTemplateKey?: string,
): TServerDrivenComponentConfig[] => {
  return useMemo(() => {
    if (!items) {
      return [];
    }

    return items.map(item => {
      if (item.templateKey) {
        return sduiContext.templateRegistry.resolveTemplateForConfig(item);
      }

      if (itemTemplateKey) {
        return sduiContext.templateRegistry.resolveTemplateForConfig({
          ...item,
          templateKey: itemTemplateKey,
        });
      }

      return item;
    });
  }, [items, sduiContext, itemTemplateKey]);
};

export default useResolveItemTemplateConfigs;
