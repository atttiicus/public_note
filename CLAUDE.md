# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 沟通前提

当我提出问题或者需求时，你需要：

- 仔细对比，然后对我进行反问
- 反问时最好带上你的建议，我会根据你的建议进行调整
- **重要**：无法读取图片、无法确认页面元素位置、需求不明确时，必须主动追问，不要猜测后直接动手

## 工作流

### 问题处理入口
当我说"处理一下问题"时，读取 `.docs/问题.md` 并按其内容处理。`.docs/问题模版.md` 是问题文件的编写模板。

### 问题处理流程
1. **深入分析** — 确定问题核心，必要时追问直到真正理解需求。尽量给出多个方案，每个方案说明实现步骤和注意事项。
2. **复杂问题拆分** — 问题过大时拆成子任务，按紧急程度排列，输出到 `.docs/tasks_list/`。逐个处理后更新任务列表。
3. **代码修改** — 涉及代码变更时必须测试 + 重构，确保质量。
4. **结果记录** — 处理完毕后记录到 `.docs/问题处理结果.md`，格式：

```markdown
## 问题简述
- 最终处理方案（不超过 500 字）
- 最终处理结果
***
```

### 输出目录
要求输出文档时，默认放到 `.docs/ai_output/`。

### 上下文文件
处理问题前，如果存在 `.docs/ai_read.md` 或 `.docs/规范/` 目录下的文件，先读取了解规范和需求。

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

### Pagination & Series Grouping
`src/utils/notes.ts` drives the homepage and paginated note lists:

- **`ITEMS_PER_PAGE = 6`** — notes per page
- **`buildRenderItems(notes)`** — sorts notes by title (zh-CN collation), then groups notes with the same `series` frontmatter into a `SeriesGroup` (collapsible header with ordered item list). Notes without a `series` appear as standalone cards.
- **`getPage(allItems, page)`** — slices the flat `RenderItem[]` into the current page

Homepage (`index.astro`) always shows page 1. Pages 2+ are handled by `src/pages/page/[page].astro` via `getStaticPaths()` — it generates only pages that have content (skipping page 1).

> **Duplicate styles**: `page/[page].astro` duplicates series-group CSS from `index.astro`. Changes to series styling must be made in both files.

### Related Notes (Note Detail)
In `[...slug].astro`, each note gets related recommendations at the bottom:

- **Series match** (note has `series`): all notes in the same series, sorted by `order`, shown as an ordered list with "current" indicator. Strips the `{series}-` prefix from titles for cleaner display.
- **Tag overlap** (no series, has tags): up to 4 notes with the most overlapping tags (sorted by overlap count), shown as NoteCards in a 2-column grid.
- Otherwise, no related section is rendered.

### Styling
Global CSS variables are in `src/styles/styles.css`. **UnoCSS is also active** — when adding a new class name that looks like a utility (e.g. `animate-fade-in-up`), UnoCSS will generate its own CSS for it and that may conflict. To override UnoCSS-generated styles, use `!important` in `styles.css` or avoid utility-like class names for custom CSS targets.

**Theme**: Coffee/warm palette. Light: `--color-primary: #7b5c44`. Dark: `--color-primary: #cc9a72`. CSS vars are in `:root` and `.dark` selectors. Full set of custom properties: color tokens (`--color-bg`, `--color-bg-secondary`, `--color-bg-card`, `--color-text`, `--color-text-muted`, `--color-border`, `--color-hover`, `--color-code-bg`, `--color-pre-bg`), callout tokens (`--callout-warning-*`, `--callout-tips-*`, `--callout-note-*`), dimension tokens (`--header-height`, `--content-max-width`), and transition tokens (`--transition-fast`, `--transition-base`, `--transition-slow`).

**Fonts**: Self-hosted via `@fontsource` (imported in `BaseLayout.astro`):
- **Display**: Playfair Display (`--font-display`) — hero titles
- **Serif/Body**: Lora (`--font-serif`) — prose body, note descriptions
- **Mono**: JetBrains Mono (`--font-mono`) — code blocks and inline code

**UnoCSS config** (`uno.config.ts`): `presetUno()` + `presetTypography()` with custom CSS overrides for prose elements. Custom `coffee` color palette. Two shortcuts: `btn-icon` (icon button base) and `nav-link`. Transformers: `transformerDirectives()` (enables `@apply` in `<style>` blocks) and `transformerVariantGroup()`.

**Animations**: Controlled entirely by GSAP (no CSS animations). The GSAP script lives in `BaseLayout.astro`. Any element with `data-enter` attribute will fade in (`autoAlpha: 0 → 1`, 0.35s, `power2.out`) simultaneously on page load. Uses `window.matchMedia('prefers-reduced-motion')` to skip animation when needed. A `document.body.dataset.enterInit` guard prevents re-runs on HMR.

Do **not** use class names like `animate-fade-in-up` for animation targets — UnoCSS treats them as utility classes and generates conflicting CSS (`translate3d(0, 100%, 0)`). Use `data-enter` or other data attributes instead.

### Layouts
- `BaseLayout.astro` — Root HTML shell. Contains theme-flicker-prevention inline script and imports global CSS.
- `NoteLayout.astro` — Note detail layout. Injects: language badge + copy button on code blocks, Mermaid diagram rendering, TOC sidebar (React island). Uses `astro:after-swap` event to re-run code block enhancement and Mermaid rendering after Astro View Transitions navigation.

### Markdown Features
Configured in `astro.config.mjs`:
- **Math**: `remark-math` + `rehype-katex` — use `$inline$` and `$$display$$`
- **Callouts**: `:::warning`, `:::tips`, `:::note` via `src/plugins/remark-callout.mjs` (processes `remark-directive` container/leaf directives)
- **Diagrams**: Mermaid (rendered client-side in `NoteLayout.astro`)
- **Code**: Shiki dual-theme (github-light/github-dark). A custom Shiki transformer adds `data-language` attribute to `<pre>` elements, consumed by the code block enhancement script in `NoteLayout.astro`.

### Website List
Curated links are in `src/data/website.ts`. The `websites.astro` page reads from this file. `src/data/index.ts` is a barrel export.
