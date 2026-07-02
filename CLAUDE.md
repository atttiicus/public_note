# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 沟通前提

当我提出问题或者需求时，你需要：

- 仔细对比，然后对我进行反问
- 反问时最好带上你的建议，我会根据你的建议进行调整

## Commands

```bash
pnpm dev          # Start dev server (use this, not npm)
pnpm build        # astro check (TypeScript) + astro build
pnpm preview      # Preview production build locally
pnpm lint         # ESLint
pnpm lint:fix     # ESLint auto-fix
pnpm format       # Prettier
```

> **Build errors**: `pnpm build` runs `astro check` first and will fail on TypeScript errors. To build without type checking: `pnpm exec astro build`

## Architecture

### Stack
- **Astro 5** (SSG, MPA — no client-side routing)
- **React 18** only for interactive islands: `Search.tsx`, `TableOfContents.tsx`, `ThemeToggle.tsx`
- **UnoCSS** with `presetUno()` — replaces Tailwind. CSS utilities are generated on demand from class names found in source files.
- **Package manager**: pnpm (npm will fail due to pnpm lockfile/symlink format)

### Content
Notes live in `src/content/notes/` as Markdown/MDX. Schema is in `src/content/config.ts`:

```ts
title: string
description?: string
date?: date
tags?: string[]
series?: string   // Groups notes on homepage under a collapsible header
order?: number    // Sort order within a series
```

New notes go in `src/content/notes/`. Do **not** modify existing `.md` files in that directory unless explicitly asked — they are the user's personal notes. Only style/component changes are acceptable without explicit permission.

### Routing
| URL | File |
|-----|------|
| `/` | `src/pages/index.astro` |
| `/notes/[slug]` | `src/pages/notes/[...slug].astro` |
| `/tags` | `src/pages/tags/index.astro` |
| `/tags/[tag]` | `src/pages/tags/[tag].astro` |
| `/search` | `src/pages/search.astro` |
| `/websites` | `src/pages/websites.astro` |

### Styling
Global CSS variables are in `src/styles/styles.css`. **UnoCSS is also active** — when adding a new class name that looks like a utility (e.g. `animate-fade-in-up`), UnoCSS will generate its own CSS for it and that may conflict. To override UnoCSS-generated styles, use `!important` in `styles.css` or avoid utility-like class names for custom CSS targets.

**Theme**: Coffee/warm palette. Light: `--color-primary: #7b5c44`. Dark: `--color-primary: #cc9a72`. CSS vars are in `:root` and `.dark` selectors.

**Animations**: Controlled entirely by GSAP (no CSS animations). The GSAP script lives in `BaseLayout.astro`. Any element with `data-enter` attribute will fade in (`autoAlpha: 0 → 1`, 0.35s, `power2.out`) simultaneously on page load. Uses `window.matchMedia('prefers-reduced-motion')` to skip animation when needed. A `document.body.dataset.enterInit` guard prevents re-runs on HMR.

Do **not** use class names like `animate-fade-in-up` for animation targets — UnoCSS treats them as utility classes and generates conflicting CSS (`translate3d(0, 100%, 0)`). Use `data-enter` or other data attributes instead.

### Layouts
- `BaseLayout.astro` — Root HTML shell. Contains theme-flicker-prevention inline script and imports global CSS.
- `NoteLayout.astro` — Note detail layout. Injects: language badge + copy button on code blocks, Mermaid diagram rendering, TOC sidebar (React island).

### Markdown Features
Configured in `astro.config.mjs`:
- **Math**: `remark-math` + `rehype-katex` — use `$inline$` and `$$display$$`
- **Callouts**: `:::warning`, `:::tips`, `:::note` via `src/plugins/remark-callout.mjs`
- **Diagrams**: Mermaid (rendered client-side in `NoteLayout.astro`)
- **Code**: Shiki dual-theme (github-light/github-dark)

### Website List
Curated links are in `src/data/website.ts`. The `websites.astro` page reads from this file.
