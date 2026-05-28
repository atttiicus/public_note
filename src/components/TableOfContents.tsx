import { useState, useEffect, useRef } from 'react'

interface Heading {
  id: string
  text: string
  level: number
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const observerRef = useRef<IntersectionObserver | null>(null)

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

    // 用 IntersectionObserver 追踪当前可见标题
    observerRef.current?.disconnect()
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // 找第一个进入视口的标题
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: '-68px 0px -55% 0px',
        threshold: 0,
      }
    )

    heads.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observerRef.current!.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [])

  // 不足 3 个标题不展示
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
            <a href={`#${h.id}`} onClick={(e) => {
              e.preventDefault()
              document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' })
              setActiveId(h.id)
            }}>
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
          font-size: 0.6875rem;
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
          gap: 0.1rem;
        }

        .toc-item a {
          display: block;
          font-family: var(--font-sans);
          font-size: 0.8125rem;
          line-height: 1.5;
          color: var(--color-text-muted);
          text-decoration: none;
          padding: 0.25rem 0.5rem;
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
        .toc-l2 a { padding-left: 1rem; font-size: 0.8125rem; }
        .toc-l3 a { padding-left: 1.625rem; font-size: 0.75rem; }
      `}</style>
    </nav>
  )
}
