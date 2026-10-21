import type { SduiTemplateStore, UiComponentTemplate } from "../types";

/**
 * In-memory cache of SDUI templates keyed by both `templateId` and
 * `robloxComponent`. Templates arrive as part of an SDUI API response and
 * are looked up at render time by:
 *
 * - `robloxComponent` — primary lookup. Page entry resolution uses this.
 * - `templateId` — direct lookup for callers that already know a specific
 *   template ID.
 *
 * Cardinality:
 * - `templateId` → template is one-to-one (IDs are unique within a response).
 * - `robloxComponent` → template is many-to-one in principle (the system
 *   allows multiple aliases to share one template payload), but there's no
 *   practical use case for this today. In current surfaces every alias maps
 *   to a distinct template.
 */

export function createSduiTemplateStore(): SduiTemplateStore {
  let templateById = new Map<string, UiComponentTemplate>();
  let templateIdByRobloxComponent = new Map<string, string>();
  return {
    getTemplate(templateId) {
      return templateById.get(templateId);
    },

    getTemplateByRobloxComponent(robloxComponent) {
      const templateId = templateIdByRobloxComponent.get(robloxComponent);
      return templateId ? templateById.get(templateId) : undefined;
    },

    addTemplates(templates) {
      for (const [id, entry] of Object.entries(templates)) {
        if (!templateById.has(id)) {
          templateById.set(id, entry.template);
        }
        if (entry.robloxComponent) {
          templateIdByRobloxComponent.set(entry.robloxComponent, id);
        }
      }
    },

    snapshot() {
      return {
        templateById: new Map(templateById),
        templateIdByRobloxComponent: new Map(templateIdByRobloxComponent),
      };
    },

    restore(snapshot) {
      templateById = new Map(snapshot.templateById);
      templateIdByRobloxComponent = new Map(snapshot.templateIdByRobloxComponent);
    },

    clear() {
      templateById.clear();
      templateIdByRobloxComponent.clear();
    },
  };
}
