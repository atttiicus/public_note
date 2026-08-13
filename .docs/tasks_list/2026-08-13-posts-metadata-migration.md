# posts 文章元数据迁移任务列表（2026-08-13）

## 背景
用户添加了 53 篇博客文章（根目录 11 篇新格式 + 2023/2024/2025 子目录 42 篇旧格式）。
旧格式文章 frontmatter 与 `src/content/config.ts` 的 posts schema 不符（缺必填 `pubDatetime`，用了 `pubDate`/`image`），导致 `astro check` / `pnpm build` 直接失败。

## 已确认方案（用户选择）
1. **slug**：重命名文件为标题中文拼音（URL 即拼音）；超过 20 字符用全拼音首字母连写（英文/数字保留原样）
2. **目录**：保留 2023/2024/2025 年份子目录
3. **多余字段**：清理 schema 外字段（author/class/image/updatedDate/featured/slug）
4. **coverImage**：暂时空置（有真实 URL 的保留，注释掉的删除）
5. **description**：缺失/为空的根据文章内容生成

---

# 子任务1（紧急）：编写并执行 frontmatter 迁移脚本 ✅
- 方案：Node 脚本（临时，处理完删除），用 yaml 库解析 frontmatter
  - 旧格式（有 pubDate）：pubDate → pubDatetime；image → coverImage（空则删）；删除 author/class/image/featured/updatedDate；tags 规范化
  - 新格式（根目录文章）：删除 slug/featured 字段；注释掉的 coverImage 行删除
  - 日期规范化：`2025-1-24` → `2025-01-24`；updatedDate → modDatetime
- 注意事项：description 为空的文章不覆盖，单独子任务处理；不修改正文内容
## 用户选择的处理方案
- 脚本自动转换 + 人工复核
- 最终处理结果：53 篇全部转换成功，标题逐一校验通过，正文未改动；脚本已删除

# 子任务2（紧急）：重命名 53 篇文章为拼音 slug ✅
- 方案：按 slug 映射表执行 rename
- 注意事项：确保 slug 唯一；中文标题多音字人工确认（绝区零、矛盾螺旋、汕头等）
## 用户选择的处理方案
- 脚本生成映射 + 执行重命名
- 最终处理结果：53 篇重命名完成（根目录 11 篇平铺 + 2023/13 篇 + 2024/25 篇 + 2025/4 篇），slug 无冲突，URL 验证通过

# 子任务3（紧急）：补齐空 description + 修复死链 ✅
- 5 篇空 description：post230331（CDN）、post230618（跨Tab通信）、post240417（keep-alive）、post250217（Git心得）、post250524（KCP）
- 死链：post230515 引用不存在的 ./post230510（事件循环文章）→ 改为指向 2024/宏任务与微任务 的绝对链接或纯文本
## 用户选择的处理方案
- 根据文章内容手工生成描述；死链改为指向相关文章
- 最终处理结果：5 篇 description 已根据正文生成；死链改为 `/posts/2024/hrwywrw`（宏任务与微任务），链接验证 200

# 子任务4（紧急）：完整测试 ✅
- pnpm build（astro check + 构建）零报错
- pnpm dev 启动，浏览器验证：/posts 列表、文章详情页、时间线页正常
## 用户选择的处理方案
- 构建 + 页面验证
- 最终处理结果：`pnpm build` 153 页构建零报错；dev server 验证 /posts 列表（日期倒序）、详情页、/posts/page/2、/timeline 全部 200，旧链接 404 已消失

***

## 处理结果记录
已同步到 `.docs/问题处理结果.md`（2026-08-13）
