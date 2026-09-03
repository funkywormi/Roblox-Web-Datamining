import "core-js/stable"; // https://github.com/zloirock/core-js/blob/master/docs/2019-03-19-core-js-3-babel-and-a-look-into-the-future.md
import "regenerator-runtime/runtime"; // https://babeljs.io/blog/2019/03/19/7.4.0
import "intersection-observer"; // https://www.npmjs.com/package/intersection-observer
import applyHistoryPolyfill from "./history";

// @ts-expect-error Purposefully polyfilling potentially missing global.
window.globalThis ??= window;

applyHistoryPolyfill();
