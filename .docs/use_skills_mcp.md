# Skills / MCP 扫描结果

> 处理「笔记/博客/时间线页面头部统一」问题时扫描（2026-08-30），按对话约束要求6输出。

## 已安装 Skills

| Skill | 用途 | 本次是否相关 |
|---|---|---|
| simplify | 审查变更代码的复用性/质量/效率并修复 | ✅ 已启用，用于改后审查（修复 2 处） |
| update-config | 配置 settings.json（权限、hooks 等） | ❌ 无关 |
| keybindings-help | 自定义键盘快捷键 | ❌ 无关 |
| fewer-permission-prompts | 减少权限弹窗 | ❌ 无关 |
| loop | 定时循环执行任务 | ❌ 无关 |
| claude-api | Anthropic API 应用开发 | ❌ 无关 |
| gsap-skills:* | GSAP 动画（core/timeline/plugins/scrolltrigger/react/…） | ❌ 本次无动画需求 |
| init / review / security-review | 初始化文档 / PR 审查 / 安全审查 | ❌ 无关 |

## 已安装 MCP

| MCP | 能力 | 本次是否相关 |
|---|---|---|
| mcp__ide__ (executeCode) | 在 Jupyter kernel 中执行 Python | ❌ 无关 |
| mcp__ide__ (getDiagnostics) | 读取 VS Code 语言诊断 | ❌ 用 `astro check` + `eslint` 替代 |

## 结论

本次为纯 Astro 静态模板 + CSS 重构，仅启用 **simplify** 完成代码审查；其余 skills/MCP 与本任务无关，未启用。
