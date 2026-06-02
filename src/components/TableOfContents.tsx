import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface Heading {
  id: string
  text: string
  level: number
}

// ── 桌面端粘性目录 ────────────────────────────────────────────
function DesktopTOC({
  headings,
  activeId,
  onItemClick,
}: {
  headings: Heading[]
  activeId: string
  onItemClick: (id: string) => void
}) {
  return (
    <nav className="toc" aria-label="文章目录">
      <div className="toc-header">
        <p className="toc-label">目录</p>
        <button
          className="toc-top-btn"
          aria-label="回到顶部"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="回到顶部"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
      </div>
      <ul className="toc-list">
        {headings.map((h) => (
          <li
            key={h.id}
            className={['toc-item', `toc-l${h.level}`, h.id === activeId ? 'toc-active' : '']
              .filter(Boolean)
              .join(' ')}
          >
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault()
                onItemClick(h.id)
              }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// ── 移动端 FAB + 底部抽屉 ─────────────────────────────────────
function MobileTOC({
  headings,
  activeId,
  onItemClick,
}: {
  headings: Heading[]
  activeId: string
  onItemClick: (id: string) => void
}) {
  const [open, setOpen] = useState(false)

  // 打开时锁定 body 滚动
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleItemClick = (id: string) => {
    onItemClick(id)
    setOpen(false)
  }

  return (
    <>
      {/* 浮动按钮 */}
      <button className="toc-fab" onClick={() => setOpen(true)} aria-label="打开目录">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="16" y2="12" />
          <line x1="3" y1="18" x2="12" y2="18" />
        </svg>
        目录
      </button>

      {/* 遮罩 + 底部抽屉 */}
      {open && (
        <>
          <div className="toc-overlay" onClick={() => setOpen(false)} />
          <div className="toc-sheet" role="dialog" aria-label="文章目录">
            {/* 拖动把手 */}
            <div className="toc-sheet-handle" />

            <div className="toc-sheet-header">
              <span className="toc-sheet-title">目录</span>
              <button
                className="toc-sheet-close"
                onClick={() => setOpen(false)}
                aria-label="关闭目录"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <ul className="toc-sheet-list">
              {headings.map((h) => (
                <li
                  key={h.id}
                  className={[
                    'toc-sheet-item',
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
                      handleItemClick(h.id)
                    }}
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </>
  )
}

// ── 主组件 ────────────────────────────────────────────────────
export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

    const TRIGGER = 84
    let rafId = 0

    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
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
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  const handleItemClick = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setActiveId(id)
  }, [])

  if (headings.length < 3) return null

  return (
    <>
      {/* 桌面端粘性目录（父容器 ≥1100px 时显示） */}
      <DesktopTOC headings={headings} activeId={activeId} onItemClick={handleItemClick} />

      {/* 移动端 FAB + 抽屉，挂载到 body，不受父容器 display:none 影响 */}
      {mounted &&
        createPortal(
          <MobileTOC headings={headings} activeId={activeId} onItemClick={handleItemClick} />,
          document.body
        )}

      <style>{`
        /* ── 桌面端 ── */
        .toc {
          padding-right: 0.25rem;
        }

        .toc-header {
          position: sticky;
          top: 0;
          z-index: 1;
          background-color: var(--color-bg);
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 0 0 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--color-border);
        }
        .toc-label {
          font-family: var(--font-sans);
          font-size: 1.05rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--color-text-muted);
          margin: 0;
        }
        .toc-top-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: 1px solid var(--color-border);
          border-radius: 4px;
          background: none;
          color: var(--color-text-muted);
          cursor: pointer;
          flex-shrink: 0;
          transition: color var(--transition-fast), border-color var(--transition-fast), background-color var(--transition-fast);
        }
        .toc-top-btn:hover {
          color: var(--color-primary);
          border-color: var(--color-primary-light);
          background-color: var(--color-hover);
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
        .toc-item a:hover { color: var(--color-primary); background-color: var(--color-hover); }
        .toc-item.toc-active a {
          color: var(--color-primary);
          border-left-color: var(--color-primary);
          background-color: var(--color-hover);
          font-weight: 500;
        }
        .toc-l1 a { padding-left: 0.5rem; }
        .toc-l2 a { padding-left: 1rem; font-size: 0.875rem; }
        .toc-l3 a { padding-left: 1.625rem; font-size: 0.8125rem; }

        /* ── 移动端 FAB ── */
        .toc-fab {
          display: none;
          position: fixed;
          bottom: 1.75rem;
          right: 1.25rem;
          z-index: 200;
          align-items: center;
          gap: 0.4rem;
          padding: 0.6rem 1rem;
          background-color: var(--color-primary);
          color: #fff;
          border: none;
          border-radius: 100px;
          font-family: var(--font-sans);
          font-size: 0.9375rem;
          font-weight: 500;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(107, 79, 58, 0.35);
          transition: background-color 150ms ease, transform 150ms ease;
        }
        .toc-fab:hover { background-color: var(--color-primary-hover); transform: translateY(-1px); }
        .toc-fab:active { transform: translateY(0); }

        @media (max-width: 1099px) {
          .toc-fab { display: inline-flex; }
        }

        /* ── 遮罩 ── */
        .toc-overlay {
          position: fixed;
          inset: 0;
          z-index: 300;
          background: rgba(0, 0, 0, 0.45);
          animation: tocFadeIn 0.2s ease;
        }

        /* ── 底部抽屉 ── */
        .toc-sheet {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 301;
          background-color: var(--color-bg);
          border-radius: 16px 16px 0 0;
          max-height: 72vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 -4px 32px rgba(0, 0, 0, 0.15);
          animation: tocSlideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1);
        }

        .toc-sheet-handle {
          width: 40px;
          height: 4px;
          background: var(--color-border);
          border-radius: 2px;
          margin: 0.75rem auto 0;
          flex-shrink: 0;
        }

        .toc-sheet-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.875rem 1.25rem 0.625rem;
          flex-shrink: 0;
          border-bottom: 1px solid var(--color-border);
        }

        .toc-sheet-title {
          font-family: var(--font-sans);
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text);
        }

        .toc-sheet-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: var(--color-bg-secondary);
          border-radius: 50%;
          cursor: pointer;
          color: var(--color-text-muted);
          transition: background-color 150ms ease;
        }
        .toc-sheet-close:hover { background: var(--color-hover); }

        .toc-sheet-list {
          list-style: none;
          margin: 0;
          padding: 0.5rem 0 1.5rem;
          overflow-y: auto;
          flex: 1;
        }
        .toc-sheet-list::-webkit-scrollbar { width: 4px; }
        .toc-sheet-list::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 2px; }

        .toc-sheet-item a {
          display: block;
          font-family: var(--font-sans);
          font-size: 0.9375rem;
          line-height: 1.5;
          color: var(--color-text-muted);
          text-decoration: none;
          padding: 0.5rem 1.25rem;
          border-left: 3px solid transparent;
          transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
        }
        .toc-sheet-item a:active { background-color: var(--color-hover); }
        .toc-sheet-item.toc-active a {
          color: var(--color-primary);
          border-left-color: var(--color-primary);
          background-color: var(--color-hover);
          font-weight: 500;
        }
        .toc-sheet-item.toc-l2 a { padding-left: 2rem; font-size: 0.875rem; }
        .toc-sheet-item.toc-l3 a { padding-left: 2.75rem; font-size: 0.8125rem; }

        /* ── 动画 ── */
        @keyframes tocFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes tocSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
