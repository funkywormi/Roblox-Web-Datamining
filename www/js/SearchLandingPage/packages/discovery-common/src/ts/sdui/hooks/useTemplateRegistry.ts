import { useCallback, useMemo } from "react";
import { merge, cloneDeep } from "lodash";
import {
  TSduiPageContext,
  TSduiTemplateRegistry,
  TServerDrivenComponentConfig,
} from "../system/SduiTypes";
import logSduiError, { SduiErrorNames } from "../utils/logSduiError";

const deepCopyAndMerge = (
  base: Record<string, unknown> | undefined,
  override: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined => {
  if (!base) {
    return cloneDeep(override);
  }

  return merge(cloneDeep(base), override);
};

const useTemplateRegistry = (
  templates: Record<string, TServerDrivenComponentConfig> | undefined,
  pageContext: TSduiPageContext,
): TSduiTemplateRegistry => {
  // Create a map of template keys to template configs for efficient lookup
  const templateMap = useMemo(() => {
    const map = new Map<string, TServerDrivenComponentConfig>();

    if (templates) {
      Object.entries(templates).forEach(([templateKey, template]) => {
        map.set(templateKey, template);
      });
    }

    return map;
  }, [templates]);

  // Resolve a template for a component config, and return the resolved config
  const resolveTemplateForConfig = useCallback(
    (
      componentConfig: TServerDrivenComponentConfig,
      seenTemplates?: Record<string, boolean>,
    ): TServerDrivenComponentConfig => {
      const { templateKey } = componentConfig;

      if (!templateKey) {
        return componentConfig;
      }

      const updatedComponentConfig = cloneDeep(componentConfig);

      // Prevent circular references between templates based on the template key
      if (seenTemplates && seenTemplates[templateKey]) {
        logSduiError(
          SduiErrorNames.TemplateResolutionCircularReference,
          `Circular reference detected for template key: ${templateKey}`,
          pageContext,
        );

        updatedComponentConfig.templateKey = undefined;
        return updatedComponentConfig;
      }

      // Track seen templates to prevent cycles
      const templatesRecord = seenTemplates || {};
      templatesRecord[templateKey] = true;

      const template = templateMap.get(templateKey);

      if (!template) {
        logSduiError(
          SduiErrorNames.TemplateResolutionTemplateNotFound,
          `Template not found for template key: ${templateKey} with config: ${JSON.stringify(
            componentConfig,
          )}`,
          pageContext,
        );

        updatedComponentConfig.templateKey = undefined;
        return updatedComponentConfig;
      }

      // Recursively resolve any template references in the template itself
      const resolvedTemplate = resolveTemplateForConfig(template, templatesRecord);

      // Clear the template key to prevent further resolution
      updatedComponentConfig.templateKey = undefined;

      // Merge component type from template
      if (!componentConfig.componentType) {
        updatedComponentConfig.componentType = resolvedTemplate.componentType;
      } else if (
        componentConfig.componentType &&
        resolvedTemplate.componentType &&
        componentConfig.componentType !== resolvedTemplate.componentType
      ) {
        logSduiError(
          SduiErrorNames.TemplateResolutionComponentTypeMismatch,
          `Component type mismatch for template key: ${templateKey}. Template type: ${resolvedTemplate.componentType}, Config type: ${componentConfig.componentType}`,
          pageContext,
        );

        return updatedComponentConfig;
      }

      // Merge analytics data from template
      if (resolvedTemplate.analyticsData) {
        updatedComponentConfig.analyticsData = {
          ...resolvedTemplate.analyticsData,
          ...componentConfig.analyticsData,
        };
      }

      // Deep merge props from template, overriding with componentConfig props
      if (resolvedTemplate.props) {
        updatedComponentConfig.props =
          deepCopyAndMerge(resolvedTemplate.props, componentConfig.props) ?? {};
      }

      // Merge lists of children together
      if (resolvedTemplate.children) {
        updatedComponentConfig.children = [
          ...resolvedTemplate.children,
          ...(componentConfig.children || []),
        ];
      }

      return updatedComponentConfig;
    },
    [templateMap, pageContext],
  );

  return useMemo(() => {
    return {
      resolveTemplateForConfig,
    };
  }, [resolveTemplateForConfig]);
};

export default useTemplateRegistry;
