import { useState, useEffect } from 'react'

interface Heading {
  id: string
  text: string
  level: number
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const article = document.querySelector('.note-content')
    if (!article) return

    const heads = Array.from(article.querySelectorAll('h1, h2, h3'))
      .filter((h) => h.id)
      .map((h) => ({
        id: h.id,
        text: h.textContent?.trim() ?? '',
        level: parseInt(h.tagName[1]),
      }))

    setHeadings(heads)
    if (heads.length === 0) return

    // 触发线：header 高度 + 16px 余量
    const TRIGGER = 84

    let rafId = 0
    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        // 遍历所有标题（文档顺序），找最后一个"已滚过触发线"的
        let current = ''
        for (const { id } of heads) {
          const el = document.getElementById(id)
          if (!el) continue
          if (el.getBoundingClientRect().top <= TRIGGER) {
            current = id
          } else {
            break
          }
        }
        setActiveId(current)
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // 初始化一次

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  if (headings.length < 3) return null

  return (
    <nav className="toc" aria-label="文章目录">
      <p className="toc-label">目录</p>
      <ul className="toc-list">
        {headings.map((h) => (
          <li
            key={h.id}
            className={[
              'toc-item',
              `toc-l${h.level}`,
              h.id === activeId ? 'toc-active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' })
                setActiveId(h.id)
              }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>

      <style>{`
        .toc {
          position: sticky;
          top: calc(var(--header-height) + 2rem);
          max-height: calc(100vh - var(--header-height) - 4rem);
          overflow-y: auto;
          padding-right: 0.25rem;
        }

        .toc::-webkit-scrollbar { width: 4px; }
        .toc::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 2px; }

        .toc-label {
          font-family: var(--font-sans);
          font-size: 1.05rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--color-text-muted);
          margin: 0 0 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--color-border);
        }

        .toc-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .toc-item a {
          display: block;
          font-family: var(--font-sans);
          font-size: 0.9375rem;
          line-height: 1.5;
          color: var(--color-text-muted);
          text-decoration: none;
          padding: 0.3rem 0.5rem;
          border-radius: 4px;
          border-left: 2px solid transparent;
          transition: color var(--transition-fast), background-color var(--transition-fast),
            border-color var(--transition-fast);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .toc-item a:hover {
          color: var(--color-primary);
          background-color: var(--color-hover);
        }

        .toc-item.toc-active a {
          color: var(--color-primary);
          border-left-color: var(--color-primary);
          background-color: var(--color-hover);
          font-weight: 500;
        }

        /* 缩进层级 */
        .toc-l1 a { padding-left: 0.5rem; }
        .toc-l2 a { padding-left: 1rem; font-size: 0.875rem; }
        .toc-l3 a { padding-left: 1.625rem; font-size: 0.8125rem; }
      `}</style>
    </nav>
  )
}
