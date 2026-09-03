import type { AvatarAccoutrementService as TAvatarAccoutrementService } from "@rbx/avatar-common";
import * as accoutrementRulesService from "@rbx/avatar-common/src/accoutrementRules/services/accoutrementRulesService";

/**
 * Avatar accoutrement rules, sourced directly from the modern `@rbx/avatar-common` implementation —
 * the same pure-logic functions the legacy `AvatarAccoutrementRules` script bundle copies onto
 * `window.Roblox.AvatarAccoutrementService`. Importing them here (instead of the runtime global)
 * keeps the rules Next-safe with no `window.Roblox` and no script-bundle load.
 *
 * `accoutrementRulesService` is untyped JS, so the published `AvatarAccoutrementService` interface is
 * applied here; consumers keep the existing `AvatarAccoutrementService.method(...)` call shape.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- untyped JS module, typed via the published interface
const AvatarAccoutrementService = accoutrementRulesService as unknown as TAvatarAccoutrementService;

export default AvatarAccoutrementService;
