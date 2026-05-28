import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'
import UnoCSS from 'unocss/astro'
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
  ],
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
