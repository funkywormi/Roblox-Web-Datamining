// eslint-disable-next-line @typescript-eslint/triple-slash-reference -- .d.ts reference, not a runtime import, so the Next bundler doesn't try to resolve it as a module
/// <reference path="./global.d.ts" />
import ExperimentationService from "./service";

export type { ExperimentationInputs } from "./service";

export default new ExperimentationService();
