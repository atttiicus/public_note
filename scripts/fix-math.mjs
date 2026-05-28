/**
 * 将笔记中多行 $ ... $ 展示数学块转换为 $$ ... $$ 格式。
 *
 * remark-math 只支持单行 $expr$ 内联数学，不支持跨行单美元块。
 * 这些多行块在 CommonMark 解析时还会因为中间的 "=" 行触发 setext h1 heading。
 *
 * 转换规则：
 * - 段落开头的 $ expr $ (整行只有数学内容) → $$ expr $$
 * - 段落开头的 $ ... 跨行 ... $ → $$ ... $$ 块
 * - 句子中的 $ expr $ (前后有其他文字) → 保持不变（remark-math 正常处理）
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const notesDir = join(__dirname, '..', 'src', 'content', 'notes')

/** 在字符串中找第一个非转义 $ 的位置 */
function findUnescapedDollar(str) {
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '$' && (i === 0 || str[i - 1] !== '\\')) {
      return i
    }
  }
  return -1
}

/** 判断字符串是否以单个非转义 $ 结尾（排除 $$） */
function endsWithSingleDollar(str) {
  const t = str.trimEnd()
  if (!t.endsWith('$')) return false
  if (t.endsWith('$$')) return false
  if (t.length >= 2 && t[t.length - 2] === '\\') return false
  return true
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
      out.push(lines[i]) // 关闭 ---
      i++
    }
    afterBlank = true
  }

  while (i < lines.length) {
    const line = lines[i]
    const t = line.trim()

    // 跟踪代码块（不处理代码块内的内容）
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

    // 展示数学块检测：段落开头 + 单 $ 开头
    if (afterBlank && t.startsWith('$') && !t.startsWith('$$')) {
      const inner = t.slice(1) // 开头 $ 之后的内容
      const closeIdx = findUnescapedDollar(inner)

      if (closeIdx !== -1) {
        // 在同一行找到了关闭 $
        const afterClose = inner.slice(closeIdx + 1).trim()

        if (afterClose === '') {
          // 整行只有数学内容：$ expr $  →  $$\nexpr\n$$
          const mathInner = inner.slice(0, closeIdx).trim()
          out.push('$$')
          out.push(mathInner)
          out.push('$$')
          i++
          afterBlank = false
          continue
        }
        // 有尾随文字 → 是句子中的内联数学，直接输出
      } else {
        // 同行无关闭 $ → 多行展示数学块，收集直到找到关闭 $
        const mathLines = []
        const firstContent = inner.trim()
        if (firstContent) mathLines.push(firstContent)
        i++
        let closed = false

        while (i < lines.length) {
          const ml = lines[i]
          const mt = ml.trim()

          if (endsWithSingleDollar(mt)) {
            // 关闭行：去掉末尾的 $
            const c = mt.slice(0, -1).trimEnd()
            if (c) mathLines.push(c)
            closed = true
            i++
            break
          }

          // 遇到空行且尚未关闭 → 放弃收集，回退输出原始行
          if (mt === '') break

          mathLines.push(ml)
          i++
        }

        if (closed || mathLines.length > 0) {
          out.push('$$')
          // 去除首尾空行
          while (mathLines.length && !mathLines[0].trim()) mathLines.shift()
          while (mathLines.length && !mathLines[mathLines.length - 1].trim()) mathLines.pop()
          out.push(...mathLines)
          out.push('$$')
          afterBlank = false
          continue
        }

        // 没有找到关闭，原样输出
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

// 处理所有笔记文件
const files = readdirSync(notesDir).filter((f) => f.endsWith('.md'))
for (const file of files) {
  const filePath = join(notesDir, file)
  const content = readFileSync(filePath, 'utf-8')
  const fixed = fixDisplayMath(content)
  if (fixed !== content) {
    writeFileSync(filePath, fixed, 'utf-8')
    console.log(`Fixed: ${file}`)
  } else {
    console.log(`No changes: ${file}`)
  }
}
