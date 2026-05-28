/**
 * 将笔记中多行 $ ... $ 展示数学块转换为 $$ ... $$ 格式。
 *
 * 关键改进：在多行收集模式中，查找行内第一个未转义 $ 作为关闭符，
 * 而非只检查"行尾是 $"。这样能正确处理
 *   \end{bmatrix} $即代表点 $ \left(...) $。
 * 这类"关闭 $ 后面紧跟中文"的情况。
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const notesDir = join(__dirname, '..', 'src', 'content', 'notes')

/** 在字符串中找第一个非转义 $ 的位置，找不到返回 -1 */
function findUnescapedDollar(str) {
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '$' && (i === 0 || str[i - 1] !== '\\')) {
      return i
    }
  }
  return -1
}

function fixDisplayMath(content) {
  const lines = content.split('\n')
  const out = []
  let i = 0
  let inCode = false
  let afterBlank = true // 文件开头视为空行之后

  // 跳过 frontmatter
  if (lines[0] === '---') {
    out.push(lines[0])
    i = 1
    while (i < lines.length && lines[i] !== '---') {
      out.push(lines[i])
      i++
    }
    if (i < lines.length) {
      out.push(lines[i])
      i++
    }
    afterBlank = true
  }

  while (i < lines.length) {
    const line = lines[i]
    const t = line.trim()

    // 代码块：进入/退出，内部不处理
    if (t.startsWith('```') || t.startsWith('~~~')) {
      inCode = !inCode
      out.push(line)
      i++
      afterBlank = false
      continue
    }
    if (inCode) {
      out.push(line)
      i++
      continue
    }

    // 展示数学块检测：段落开头 + 单 $ 开头（非 $$）
    if (afterBlank && t.startsWith('$') && !t.startsWith('$$')) {
      const inner = t.slice(1) // 开头 $ 之后的内容
      const closeIdx = findUnescapedDollar(inner)

      if (closeIdx !== -1) {
        // 同一行找到了关闭 $
        const afterClose = inner.slice(closeIdx + 1).trim()
        if (afterClose === '') {
          // 整行只有数学，无尾随文本 → 单行展示数学
          const mathInner = inner.slice(0, closeIdx).trim()
          out.push('$$')
          out.push(mathInner)
          out.push('$$')
          i++
          afterBlank = false
          continue
        }
        // afterClose 非空 → 句子中的内联数学，直接输出
      } else {
        // 同行无关闭 $ → 多行展示数学块
        const mathLines = []
        const firstContent = inner.trim()
        if (firstContent) mathLines.push(firstContent)
        i++
        let closed = false
        let afterMath = '' // 关闭 $ 之后的剩余文本

        while (i < lines.length) {
          const ml = lines[i]
          const mt = ml.trim()

          // 空行 = 块结束（未正常关闭）
          if (mt === '') break

          // 找行内第一个未转义 $ → 这就是关闭符
          const dollarIdx = findUnescapedDollar(mt)
          if (dollarIdx !== -1) {
            const before = mt.slice(0, dollarIdx).trimEnd()
            if (before) mathLines.push(before)
            afterMath = mt.slice(dollarIdx + 1).trim()
            closed = true
            i++
            break
          }

          // 行内无 $ → 纯数学内容行
          mathLines.push(ml)
          i++
        }

        if (closed || mathLines.length > 0) {
          out.push('$$')
          while (mathLines.length && !mathLines[0].trim()) mathLines.shift()
          while (mathLines.length && !mathLines[mathLines.length - 1].trim()) mathLines.pop()
          out.push(...mathLines)
          out.push('$$')

          // 关闭 $ 之后若还有文本（如中文说明），单独输出为新段落
          if (afterMath) {
            out.push('')
            out.push(afterMath)
          }

          afterBlank = false
          continue
        }

        // 收集失败 → 原样输出
        out.push(line)
        i++
        afterBlank = false
        continue
      }
    }

    afterBlank = t === ''
    out.push(line)
    i++
  }

  return out.join('\n')
}

// 从原始文件重新生成（先复制，再处理）
const aiNotesDir = join(__dirname, '..', 'ai_docs', 'note')
const srcNotesDir = join(__dirname, '..', 'src', 'content', 'notes')

const frontmatters = {
  '堆.md': `---
title: 堆
description: 堆数据结构详解，包括小顶堆、大顶堆、堆的常用操作、实现原理和建堆操作的时间复杂度分析
tags: ["数据结构", "算法", "堆"]
---

`,
  '树.md': `---
title: 二叉树
description: 二叉树基本概念、常见术语（根节点、叶节点、高度、深度）及其结构特性
tags: ["数据结构", "算法", "树"]
---

`,
  '计算机图形学.md': `---
title: 计算机图形学
description: GAMES101 课程笔记，涵盖线性代数、变换、光栅化、着色模型、纹理映射、几何等核心内容
tags: ["图形学", "GAMES101", "渲染"]
---

`,
}

const files = readdirSync(aiNotesDir).filter((f) => f.endsWith('.md'))
for (const file of files) {
  const srcPath = join(aiNotesDir, file)
  const destPath = join(srcNotesDir, file)
  const fm = frontmatters[file] ?? ''
  const original = readFileSync(srcPath, 'utf-8')
  const withFm = fm + original
  const fixed = fixDisplayMath(withFm)
  writeFileSync(destPath, fixed, 'utf-8')
  const blocks = (fixed.match(/^\$\$$/gm) || []).length / 2
  console.log(`${file}: ${blocks} display math blocks`)
}
