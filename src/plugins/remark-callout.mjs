import { visit } from 'unist-util-visit'

/**
 * Transforms :::type ... ::: directives into <div class="callout callout-type"> blocks
 */
export function remarkCallout() {
    return (tree) => {
        visit(tree, 'containerDirective', (node) => {
            const data = node.data || (node.data = {})
            data.hName = 'div'
            data.hProperties = {
                class: `callout callout-${node.name}`,
                'data-callout': node.name,
            }
        })
        visit(tree, 'leafDirective', (node) => {
            const data = node.data || (node.data = {})
            data.hName = 'div'
            data.hProperties = {
                class: `callout callout-${node.name}`,
                'data-callout': node.name,
            }
        })
    }
}
