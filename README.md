# 公开笔记

一个基于 Astro 搭建的静态笔记网站，支持 LaTeX 数学公式、代码高亮、亮/暗色主题切换，以咖啡色为主色调，风格简洁书卷。

## 功能特性

- **LaTeX 数学公式** — 通过 KaTeX 渲染，支持行内公式与展示公式
- **代码块** — Shiki 语法高亮（双主题），顶部显示语言标签，一键复制
- **目录导航** — 桌面端粘性侧边栏，移动端底部抽屉，滚动自动高亮当前章节
- **亮/暗色模式** — 跟随系统偏好，支持手动切换，偏好持久化
- **Callout 块** — 支持 `:::warning`、`:::tips`、`:::note` 语法
- **响应式布局** — 移动端与桌面端均有针对性的排版
- **过渡动画** — 页面进场、卡片 hover、抽屉滑入均有动画

## 技术栈

| 类别     | 技术                                                                                                             |
| -------- | ---------------------------------------------------------------------------------------------------------------- |
| 框架     | [Astro 5](https://astro.build)                                                                                   |
| UI 组件  | [React 18](https://react.dev)（交互组件）                                                                        |
| 样式     | [UnoCSS](https://unocss.dev)（工具类 + Typography + WebFonts）                                                   |
| 动画     | [animate.css](https://animate.style)                                                                             |
| 数学公式 | [remark-math](https://github.com/remarkjs/remark-math) + [rehype-katex](https://github.com/remarkjs/remark-math) |
| 代码高亮 | [Shiki](https://shiki.style)（内置于 Astro）                                                                     |
| Callout  | [remark-directive](https://github.com/remarkjs/remark-directive) + 自定义插件                                    |
| 字体     | Lora（正文）· Playfair Display（标题）· JetBrains Mono（代码）                                                   |
| 语言     | TypeScript                                                                                                       |

## 目录结构

```
├── astro.config.mjs          # Astro 配置（集成、Markdown 插件、Shiki）
├── uno.config.ts             # UnoCSS 配置（主题色、字体、排版扩展）
├── tsconfig.json
├── .editorconfig
├── .prettierrc
├── eslint.config.js
├── scripts/
│   └── fix-math.mjs          # 数学公式预处理脚本（$ → $$ 转换）
└── src/
    ├── components/
    │   ├── Header.astro          # 顶部导航栏（Logo、主导航、主题切换）
    │   ├── NoteCard.astro        # 首页笔记卡片
    │   ├── TableOfContents.tsx   # 目录组件（桌面粘性 + 移动底部抽屉）
    │   └── ThemeToggle.tsx       # 亮/暗色切换按钮
    ├── content/
    │   ├── config.ts             # Content Collection Schema 定义
    │   └── notes/                # 笔记文件（.md / .mdx）
    ├── layouts/
    │   ├── BaseLayout.astro      # 基础布局（HTML 骨架、防主题闪烁脚本）
    │   └── NoteLayout.astro      # 笔记页布局（正文 + 目录双栏、代码块脚本）
    ├── pages/
    │   ├── index.astro           # 首页（Hero + 笔记列表）
    │   └── notes/[...slug].astro # 笔记详情页（动态路由）
    ├── plugins/
    │   └── remark-callout.mjs    # :::type 指令 → <div class="callout"> 转换
    └── styles/
        └── styles.css            # 全局 CSS 变量、排版、代码块、动画
```

## 快速开始

**依赖**：Node.js ≥ 18、pnpm

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 类型检查 + 构建
pnpm build

# 预览构建产物
pnpm preview
```

## 编写笔记

### 新建笔记

在 `src/content/notes/` 下创建 `.md` 或 `.mdx` 文件，添加 frontmatter：

```markdown
---
title: 文章标题
description: 简短描述（可选，显示在卡片和页面副标题）
tags: ['标签一', '标签二'] # 可选
---

正文内容……
```

### 数学公式

行内公式使用 `$ ... $`，展示公式使用独立段落的 `$$ ... $$`：

```markdown
行内：$ E = mc^2 $

展示：

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

> **注意**：笔记中如果使用了单美元多行写法（`$ \begin{...}` 跨行 `... $`），运行 `node scripts/fix-math.mjs` 可自动将其转换为标准 `$$...$$` 格式。

### Callout 块

```markdown
:::warning
这是一个警告块。
:::

:::tips
这是一个提示块。
:::
```

支持类型：`warning`、`tips`、`note`。

### 代码块

代码块会自动添加语言标签和复制按钮：

````markdown
```python
def hello():
    print("Hello, World!")
```
````

## 主题定制

主色调和所有设计 token 定义在 `src/styles/styles.css` 的 CSS 变量中：

```css
:root {
    --color-primary: #7b5c44; /* 咖啡棕（亮色模式） */
    --color-bg: #fdfaf6; /* 暖白背景 */
    --font-serif: 'Lora', ...; /* 正文字体 */
}

.dark {
    --color-primary: #c4956a; /* 浅咖啡棕（暗色模式） */
    --color-bg: #1a1512; /* 深棕背景 */
}
```

修改 `--color-primary` / `--color-primary-light` / `--color-primary-hover` 即可整体换色。

## 工程配置

| 工具         | 配置文件           | 说明                                    |
| ------------ | ------------------ | --------------------------------------- |
| EditorConfig | `.editorconfig`    | UTF-8、LF 换行、2 空格缩进              |
| Prettier     | `.prettierrc`      | 无分号、单引号、`prettier-plugin-astro` |
| ESLint       | `eslint.config.js` | TypeScript + Astro 推荐规则             |

```bash
pnpm lint        # 检查
pnpm lint:fix    # 自动修复
pnpm format      # Prettier 格式化
```

## 脚本说明

### `scripts/fix-math.mjs`

从 `ai_docs/note/` 读取原始笔记，添加 frontmatter 后进行数学公式预处理，输出到 `src/content/notes/`。

预处理逻辑：

- 段落开头的 `$ expr $`（独立行，无尾随文字）→ `$$\nexpr\n$$`
- 段落开头的多行 `$ ... $` 块 → `$$\n...\n$$`
- 关闭 `$` 后跟有正文文字时（如 `\end{bmatrix} $接着说明`），数学部分提取为 `$$` 块，剩余文字作为独立段落
- 句子中间的 `$ expr $`（前后有其他文字）→ 保持不变

```bash
node scripts/fix-math.mjs
```
