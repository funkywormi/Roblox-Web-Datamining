import { useMemo } from "react";
import { useTokens } from "@rbx/core-scripts/react";
import {
  TSduiContext,
  TSduiPageContext,
  TSduiPageContextType,
  TServerDrivenComponentConfig,
} from "../system/SduiTypes";
import useTemplateRegistry from "./useTemplateRegistry";
import useSduiDataStore from "./useSduiDataStore";

/**
 * Returns a context object that contains dependencies for SDUI components
 */
const useSduiContext = (
  templates: Record<string, TServerDrivenComponentConfig> | undefined,
  pageName: TSduiPageContextType,
): TSduiContext => {
  const tokens = useTokens();

  const pageContext: TSduiPageContext = useMemo(() => {
    return { pageName };
  }, [pageName]);

  const templateRegistry = useTemplateRegistry(templates, pageContext);

  const dataStore = useSduiDataStore(pageContext);

  const dependencies = useMemo(() => {
    return {
      tokens,
    };
  }, [tokens]);

  return useMemo(() => {
    return {
      dependencies,
      templateRegistry,
      dataStore,
      pageContext,
    };
  }, [dependencies, templateRegistry, dataStore, pageContext]);
};

export default useSduiContext;
