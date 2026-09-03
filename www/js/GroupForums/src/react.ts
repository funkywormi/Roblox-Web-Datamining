import React from 'react';
import classNames from 'classnames';
/**
 * Default options for the bold renderer
 */
const DEFAULT_RENDERER_OPTIONS = {
    className: ''
};
function renderBoldLeaf(props, options) {
    const { attributes, children, leaf } = props;
    if (!leaf.bold) {
        return children;
    }
    const { className } = options;
    return React.createElement('span', {
        ...attributes,
        // Using inline style as foundation ui tailwind preset does not support font style classes
        style: {
            fontWeight: 'bold'
        },
        className: classNames(className)
    }, children);
}
/**
 * Create a bold React renderer
 */
export function createBoldRenderer(options = {}) {
    const opts = { ...DEFAULT_RENDERER_OPTIONS, ...options };
    return {
        pluginKey: 'bold',
        renderLeaf: (props) => renderBoldLeaf(props, opts)
    };
}
/**
 * Default bold renderer instance
 */
export const boldRenderer = createBoldRenderer();
//# sourceMappingURL=react.js.map