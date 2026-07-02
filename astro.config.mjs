import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'
import UnoCSS from 'unocss/astro'
import compress from '@playform/compress'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import remarkDirective from 'remark-directive'
import { remarkCallout } from './src/plugins/remark-callout.mjs'

const remarkPlugins = [remarkMath, remarkDirective, remarkCallout]
const rehypePlugins = [rehypeKatex]

export default defineConfig({
    integrations: [
        UnoCSS({ injectReset: true }),
        react(),
        mdx(),
        compress({
            HTML: false,  // 已由 compressHTML: true 处理
            Image: true,
            JavaScript: true,
            CSS: true,
            SVG: true,
        }),
    ],
    compressHTML: true,
    devToolbar: { enabled: false },
    markdown: {
        remarkPlugins,
        rehypePlugins,
        shikiConfig: {
            themes: {
                light: 'github-light',
                dark: 'github-dark',
            },
            transformers: [
                {
                    pre(node) {
                        node.properties['data-language'] = this.options.lang ?? 'text'
                    },
                },
            ],
        },
    },
})
